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

    // 2. Prepare prompt context
    const cartContext = cartItems.map(item => `${item.name} (${item.category}, ${item.brand})`).join(', ');
    const catalogContext = availableProducts.map(p => `ID: ${p._id} | Name: ${p.name} | Category: ${p.category} | Brand: ${p.brand}`).join('\n');

    const systemPrompt = `You are an expert e-commerce cross-selling AI.
Your goal is to recommend the best 3 complementary products to add to a user's cart to increase Average Order Value (AOV).
The user currently has these items in their cart:
${cartContext}

Here is the available product catalog:
${catalogContext}

Select exactly 3 product IDs from the catalog that best complement the user's cart. 
Return the response as a pure JSON array of strings containing ONLY the product IDs. DO NOT wrap the JSON in markdown blocks like \`\`\`json. Just the raw array. Example: ["id1", "id2", "id3"]`;

    // 3. Call OpenRouter AI Model
    let recommendedIds = [];
    try {
        const response = await openai.chat.completions.create({
            model: 'google/gemini-flash-1.5-8b', // Optional: You can change this to any openrouter model
            messages: [{ role: 'user', content: systemPrompt }],
        });

        const rawContent = response.choices[0].message.content.trim();
        const jsonStr = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
        recommendedIds = JSON.parse(jsonStr);
    } catch (aiError) {
        console.error('AI Processing Error:', aiError);
        // Fallback to basic if AI fails or formatting fails
        recommendedIds = availableProducts.slice(0, 3).map(p => p._id.toString());
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
