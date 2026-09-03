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
        const idMatches = rawContent.match(/[a-f0-9]{24}/gi);
        if (idMatches && idMatches.length > 0) {
            recommendedIds = [...new Set(idMatches)].slice(0, 3);
        } else {
            const jsonMatch = rawContent.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                recommendedIds = JSON.parse(jsonMatch[0]);
            }
        }
    } catch (aiError) {
        console.error('AI Processing Error:', aiError.message);
    }

    // If AI did not return valid IDs, fallback to first 3 candidate products
    if (!recommendedIds || recommendedIds.length === 0) {
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

// @desc    Intelligent AI Chatbot Assistant query with Gemini 3.8 Flash
// @route   POST /api/products/ai-chat
// @access  Public
const handleChatbotQuery = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ success: false, message: 'Query cannot be empty' });
    }

    // 1. Fetch active products from catalog
    const allProducts = await Product.find({ status: 'Active', countInStock: { $gt: 0 } })
      .select('_id name category brand description price image rating');

    // 2. Initialize OpenRouter OpenAI client
    const openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    // Pre-filter catalog by keyword/category to save tokens and avoid truncation
    const qLower = query.toLowerCase();
    let relevantProducts = allProducts;

    let candidateFilter = null;
    if (qLower.includes('shoe') || qLower.includes('sneaker') || qLower.includes('trainer') || qLower.includes('footwear')) {
      candidateFilter = (p) => p.category === 'Shoes' || (p.name || '').toLowerCase().includes('shoe') || (p.name || '').toLowerCase().includes('sneaker');
    } else if (qLower.includes('perfume') || qLower.includes('fragrance') || qLower.includes('scent')) {
      candidateFilter = (p) => p.category === 'Perfumes';
    } else if (qLower.includes('cosmetic') || qLower.includes('makeup') || qLower.includes('lipstick') || qLower.includes('cream')) {
      candidateFilter = (p) => p.category === 'Cosmetics';
    } else if (qLower.includes('chocolate') || qLower.includes('truffle') || qLower.includes('praline')) {
      candidateFilter = (p) => p.category === 'Chocolates';
    } else if (qLower.includes('watch') || qLower.includes('chronograph')) {
      candidateFilter = (p) => p.category === 'Watches';
    } else if (qLower.includes('cloth') || qLower.includes('shirt') || qLower.includes('jacket') || qLower.includes('jean') || qLower.includes('t-shirt')) {
      candidateFilter = (p) => p.category === 'Clothes';
    } else if (qLower.includes('electronic') || qLower.includes('headphone') || qLower.includes('keyboard') || qLower.includes('mouse')) {
      candidateFilter = (p) => p.category === 'Electronics';
    }

    if (candidateFilter) {
      const filtered = allProducts.filter(candidateFilter);
      if (filtered.length > 0) relevantProducts = filtered;
    }

    // Provide catalog snapshot to AI
    const catalogSummary = relevantProducts
      .map((p) => `ID: ${p._id} | Name: ${p.name} | Category: ${p.category} | Price: ₹${p.price}`)
      .join('\n');

    const systemPrompt = `You are a shopping assistant for "Growth-X Store".
User query: "${query}"

Catalog:
${catalogSummary}

Rules:
1. If the user mentions a price like "under 2000" or "below 500", match products with price <= specified amount.
2. Select up to 4 matching product IDs.

Respond with pure JSON only:
{"productIds": ["id1", "id2"], "message": "Short 1-sentence friendly response"}`;

    let responseMessage = `Here are the best matching items for "${query}":`;
    let matchingIds = [];

    try {
      console.log('Sending chatbot prompt to OpenRouter Gemini 3.8 Flash...');
      const completion = await openai.chat.completions.create({
        model: 'google/gemini-3.8-flash',
        max_tokens: 600,
        temperature: 0.2,
        messages: [{ role: 'user', content: systemPrompt }],
      });

      const rawContent = (completion.choices[0]?.message?.content || '').trim();
      console.log('Chatbot raw AI output:', rawContent);

      // Extract all 24-character hexadecimal MongoDB ObjectIds from rawContent
      const idMatches = rawContent.match(/[a-f0-9]{24}/gi);
      if (idMatches && idMatches.length > 0) {
        matchingIds = [...new Set(idMatches)].slice(0, 4);
      }

      // Extract message string if possible
      const msgMatch = rawContent.match(/"message"\s*:\s*"([^"]+)"/);
      if (msgMatch && msgMatch[1]) {
        responseMessage = msgMatch[1];
      }
    } catch (aiErr) {
      console.error('Chatbot AI Error, falling back to smart regex:', aiErr.message);
    }

    // If AI did not return valid matching IDs, apply smart deterministic filter
    if (matchingIds.length === 0) {
      const qLower = query.toLowerCase();
      let maxPrice = Infinity;
      const priceMatch = qLower.match(/under\s*(?:rs\.?|inr|₹|\$)?\s*(\d+)/i) || qLower.match(/below\s*(?:rs\.?|inr|₹|\$)?\s*(\d+)/i);
      if (priceMatch && priceMatch[1]) {
        maxPrice = parseFloat(priceMatch[1]);
      }

      const filtered = allProducts.filter((p) => {
        const cat = (p.category || '').toLowerCase();
        const name = (p.name || '').toLowerCase();
        const price = Number(p.price || 0);

        let matchesCat = true;
        if (qLower.includes('shoe') || qLower.includes('sneaker')) matchesCat = cat.includes('shoe') || name.includes('shoe') || name.includes('sneaker');
        else if (qLower.includes('perfume') || qLower.includes('fragrance')) matchesCat = cat.includes('perfume') || name.includes('parfum') || name.includes('perfume');
        else if (qLower.includes('cosmetic') || qLower.includes('lipstick') || qLower.includes('makeup')) matchesCat = cat.includes('cosmetic');
        else if (qLower.includes('chocolate')) matchesCat = cat.includes('chocolate');
        else if (qLower.includes('cloth') || qLower.includes('shirt') || qLower.includes('jacket') || qLower.includes('jean')) matchesCat = cat.includes('cloth');
        else if (qLower.includes('watch')) matchesCat = cat.includes('watch');
        else if (qLower.includes('electronic') || qLower.includes('headphone') || qLower.includes('mouse') || qLower.includes('keyboard')) matchesCat = cat.includes('electronic');

        return matchesCat && price <= maxPrice;
      });

      matchingIds = filtered.slice(0, 4).map((p) => p._id.toString());
      if (maxPrice !== Infinity) {
        responseMessage = `Here are the top options under ₹${maxPrice}:`;
      }
    }

    const matchedProducts = await Product.find({ _id: { $in: matchingIds } })
      .select('name brand category price image rating countInStock');

    res.json({
      success: true,
      message: responseMessage,
      products: matchedProducts,
    });
  } catch (error) {
    console.error('Chatbot Controller Error:', error);
    res.status(500).json({ success: false, message: 'Server error processing chatbot query' });
  }
};

module.exports = {
  getAiCheckoutRecommendations,
  handleChatbotQuery,
};
