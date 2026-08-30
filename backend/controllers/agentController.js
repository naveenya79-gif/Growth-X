const Product = require('../models/Product');

// @desc    Get Agent-Readable Catalog for AI Buyers (ACP / AP2 Standard)
// @route   GET /api/agent/catalog
// @access  Public
const getAgentCatalog = async (req, res) => {
  try {
    const products = await Product.find({ status: 'Active', countInStock: { $gt: 0 } }).sort({ createdAt: -1 });

    const agentCatalog = {
      "@context": "https://schema.org",
      "@type": "DataFeed",
      "protocol": "ACP/AP2/v1",
      "merchant": {
        "id": "revive_merchant_01",
        "name": "Growth-X (REVIVE)",
        "currency": "USD",
        "supportedPaymentGateways": ["RAZORPAY_TEST_MODE"],
        "transactionRules": {
          "maxOrderAmount": 5000,
          "requiresAuthentication": false,
          "refundPolicy": "30_DAYS_GUARANTEE"
        }
      },
      "agentCapabilities": [
        "AGENT_READABLE_CATALOG",
        "AUTONOMOUS_RECOMMENDATIONS",
        "BOUNDED_TRANSACTION_CHECKOUT",
        "AUDIT_TRAIL_RECOVERY"
      ],
      "totalItems": products.length,
      "items": products.map((item) => ({
        "@type": "Product",
        "id": item._id,
        "name": item.name,
        "description": item.description,
        "category": item.category,
        "brand": item.brand,
        "offers": {
          "@type": "Offer",
          "price": item.price,
          "priceCurrency": "USD",
          "availability": item.countInStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "stockQuantity": item.countInStock
        },
        "tags": item.tags || [],
        "rating": item.rating || 0,
        "image": item.image,
        "recommendationApi": `http://localhost:5000/api/products/${item._id}/recommendations`,
        "directBuyApi": `http://localhost:5000/api/orders`
      }))
    };

    res.json(agentCatalog);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error generating agent-readable catalog', error: error.message });
  }
};

// @desc    Get Agent-Readable Product Details
// @route   GET /api/agent/catalog/:id
// @access  Public
const getAgentProduct = async (req, res) => {
  try {
    const item = await Product.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Product not found for agent' });
    }

    res.json({
      "@context": "https://schema.org",
      "@type": "Product",
      "protocol": "ACP/AP2/v1",
      "id": item._id,
      "name": item.name,
      "description": item.description,
      "category": item.category,
      "brand": item.brand,
      "offers": {
        "@type": "Offer",
        "price": item.price,
        "priceCurrency": "USD",
        "stockQuantity": item.countInStock
      },
      "tags": item.tags || [],
      "recommendationsUrl": `http://localhost:5000/api/products/${item._id}/recommendations`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching agent product', error: error.message });
  }
};

module.exports = { getAgentCatalog, getAgentProduct };
