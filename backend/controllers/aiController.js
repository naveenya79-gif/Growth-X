const Product = require('../models/Product');
const { OpenAI } = require('openai');

const getAiCheckoutRecommendations = async (req, res) => {
  try {
    const { cartItems } = req.body;
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Initialize OpenRouter / OpenAI client
    const openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    // 1. Fetch available products from DB to provide as context
    const allProducts = await Product.find({ status: 'Active', countInStock: { $gt: 0 } })
      .select('_id name category brand description price');

    // Remove products that are already in the cart
    const cartProductIds = cartItems.map(item => item.product || item._id);
    const availableProducts = allProducts.filter(p => !cartProductIds.includes(p._id.toString()));

    if (availableProducts.length === 0) {
      return res.json({ success: true, recommendations: [] });
    }

    // Related category mapping for pre-filtering
    const COMPLEMENTARY_MAP = {
      Shoes: ['Shoes'],
      Clothes: ['Clothes'],
      Watches: ['Watches'],
      Cosmetics: ['Cosmetics', 'Perfumes'],
      Perfumes: ['Perfumes', 'Cosmetics', 'Chocolates'],
      Chocolates: ['Chocolates', 'Perfumes'],
      Electronics: ['Electronics'],
      Accessories: ['Accessories']
    };

    // Pre-filter catalog to only include relevant candidate products
    const cartCategories = cartItems.map(item => item.category);
    const allowableCategories = new Set();
    cartCategories.forEach(cat => {
      allowableCategories.add(cat);
      (COMPLEMENTARY_MAP[cat] || []).forEach(c => allowableCategories.add(c));
    });

    const candidateProducts = availableProducts.filter(p => allowableCategories.has(p.category));

    // If no candidate products match the cart categories, return empty
    if (candidateProducts.length === 0) {
      return res.json({ success: true, recommendations: [] });
    }

    // 2. Prepare prompt context with candidate products only
    const cartContext = cartItems.map(item => `${item.name} (${item.category}, ${item.brand})`).join(', ');
    const catalogContext = candidateProducts.map(p => `ID: ${p._id} | Name: ${p.name} | Category: ${p.category} | Brand: ${p.brand}`).join('\n');

    const systemPrompt = `You are an expert e-commerce cross-selling AI.
Your goal is to recommend up to 3 directly related, complementary products to add to a user's cart.
CRITICAL CONSTRAINT: Recommendations MUST be logically related or complementary to the categories in the cart.
For example:
- Cosmetics/Perfumes -> Other cosmetics, perfumes, skincare, or luxury chocolates.
- Shoes -> Other sneakers, running shoes, or footwear.
- Clothes -> Jackets, jeans, or shirts.
- Watches -> Other watches or timepieces.
- Electronics -> Headphones, keyboards, mice.
- Chocolates -> Luxury chocolates or perfumes.

DO NOT recommend completely unrelated categories.
If there are NO logically related products, return an empty array [].

The user currently has these items in their cart:
${cartContext}

Here is the candidate product catalog:
${catalogContext}

Return a pure JSON array of strings containing ONLY the product IDs. Example: ["id1", "id2", "id3"] or []`;

    // 3. Call OpenRouter AI Model (Gemini 3.8 Flash)
    let recommendedIds = [];
    try {
        const response = await openai.chat.completions.create({
            model: 'google/gemini-3.8-flash',
            max_tokens: 250,
            temperature: 0.2,
            messages: [{ role: 'user', content: systemPrompt }],
        });

        const rawContent = (response.choices[0]?.message?.content || '').trim();
        const jsonMatch = rawContent.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            recommendedIds = JSON.parse(jsonMatch[0]);
        } else {
            recommendedIds = JSON.parse(rawContent);
        }
    } catch (aiError) {
        console.error('AI Processing Error:', aiError.message);
        // Fallback: pick top 3 from candidate products only
        recommendedIds = candidateProducts.slice(0, 3).map(p => p._id.toString());
    }

    // 4. Fetch the full product objects for the chosen IDs
    const recommendations = await Product.find({ _id: { $in: recommendedIds } })
      .select('name brand category tags price image rating countInStock');

    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('AI Recommendation Controller Error:', error);
    res.status(500).json({ success: false, message: 'Server error processing AI recommendations' });
  }
};

module.exports = {
  getAiCheckoutRecommendations
};
