const express = require("express")
const Product = require("../models/Product")
const axios = require("axios")

const router = express.Router()

// AI Provider Configuration
const COHERE_API_KEY = process.env.COHERE_API_KEY
const COHERE_API_URL = "https://api.cohere.ai/v1/generate"
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY
const TOGETHER_API_URL = "https://api.together.xyz/inference"
const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
const AI_PROVIDER = process.env.AI_PROVIDER || "rule_based"

// Helper function to escape regex special characters
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

// Helper function to search products based on query
async function searchProducts(query) {
  try {
    const cleanQuery = query ? query.trim() : ""
    if (!cleanQuery || cleanQuery.length < 1) {
      return []
    }

    // First try text search
    let products = await Product.find({ $text: { $search: cleanQuery } }, { score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } })
      .limit(10)

    // If no results from text search, try partial matching
    if (products.length === 0) {
      const escapedQuery = escapeRegex(cleanQuery)
      const searchRegex = new RegExp(escapedQuery, "i")

      products = await Product.find({
        $or: [
          { name: { $regex: searchRegex } },
          { description: { $regex: searchRegex } },
          { categories: { $in: [searchRegex] } },
          { colors: { $in: [searchRegex] } },
          { sizes: { $in: [searchRegex] } },
        ],
      }).limit(10)
    }

    return products
  } catch (error) {
    console.error("Error searching products:", error)
    return []
  }
}

// Helper function to get featured products
async function getFeaturedProducts() {
  try {
    return await Product.find({ featured: true }).limit(5)
  } catch (error) {
    console.error("Error getting featured products:", error)
    return []
  }
}

// Helper function to get products on sale
async function getSaleProducts() {
  try {
    return await Product.find({
      salePrice: { $ne: null },
      inStock: true,
    }).limit(5)
  } catch (error) {
    console.error("Error getting sale products:", error)
    return []
  }
}

// Helper function to get all categories
async function getCategories() {
  try {
    const categories = await Product.distinct("categories")
    return categories.filter((cat) => cat && cat.trim() !== "")
  } catch (error) {
    console.error("Error getting categories:", error)
    return []
  }
}

// Function to detect intent from user message
function detectIntent(message) {
  const lowerMessage = message.toLowerCase()

  const intents = {
    search: [
      "اعرض",
      "أرني",
      "ابحث",
      "show",
      "search",
      "find",
      "قمصان",
      "بنطلون",
      "فستان",
      "pants",
      "shirt",
      "dress",
      "baggy",
      "carhartt",
    ],
    sale: ["عرض", "تخفيض", "خصم", "sale", "discount", "offer", "عروض"],
    featured: ["مميز", "أفضل", "مقترح", "featured", "best", "recommend", "اقتراح"],
    categories: ["فئة", "نوع", "أقسام", "category", "categories", "type"],
    greeting: ["مرحبا", "السلام", "أهلا", "hello", "hi", "مساء", "صباح", "الجديد", "جديد"],
    help: ["مساعدة", "help", "ماذا", "كيف", "what", "how"],
  }

  for (const [intent, keywords] of Object.entries(intents)) {
    if (keywords.some((keyword) => lowerMessage.includes(keyword))) {
      return intent
    }
  }

  return "general"
}

// AI API Functions
async function callCohere(prompt) {
  try {
    const response = await axios.post(
      COHERE_API_URL,
      {
        model: "command-light",
        prompt: prompt,
        max_tokens: 200,
        temperature: 0.7,
        k: 0,
        stop_sequences: [],
        return_likelihoods: "NONE",
      },
      {
        headers: {
          Authorization: `Bearer ${COHERE_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      },
    )

    return response.data.generations[0].text.trim()
  } catch (error) {
    console.error("Cohere API error:", error.message)
    throw new Error("فشل في الاتصال بالذكاء الاصطناعي")
  }
}

async function callTogether(prompt) {
  try {
    const response = await axios.post(
      TOGETHER_API_URL,
      {
        model: "togethercomputer/llama-2-7b-chat",
        prompt: prompt,
        max_tokens: 200,
        temperature: 0.7,
        top_p: 0.7,
        top_k: 50,
        repetition_penalty: 1,
        stop: ["</s>"],
      },
      {
        headers: {
          Authorization: `Bearer ${TOGETHER_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      },
    )

    return response.data.output.choices[0].text.trim()
  } catch (error) {
    console.error("Together AI error:", error.message)
    throw new Error("فشل في الاتصال بالذكاء الاصطناعي")
  }
}

async function callGroq(prompt) {
  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        messages: [
          {
            role: "system",
            content:
              "أنت مساعد ذكي لمتجر ملابس. اجعل ردودك منظمة ومفيدة باللغة العربية. استخدم الرموز التعبيرية والتنسيق الجميل.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama3-8b-8192",
        temperature: 0.7,
        max_tokens: 300,
        top_p: 1,
        stream: false,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      },
    )

    return response.data.choices[0].message.content.trim()
  } catch (error) {
    console.error("Groq API error:", error.message)
    throw new Error("فشل في الاتصال بالذكاء الاصطناعي")
  }
}

// Function to format product info beautifully
function formatProductInfo(product) {
  const price = product.salePrice
    ? `💰 **${product.salePrice} دينار** ~~${product.price} دينار~~`
    : `💰 **${product.price} دينار**`

  let info = `**${product.name}**\n${price}\n`

  if (product.colors && product.colors.length > 0) {
    info += `🎨 الألوان: ${product.colors.join(", ")}\n`
  }

  if (product.sizes && product.sizes.length > 0) {
    info += `📏 المقاسات: ${product.sizes.join(", ")}\n`
  }

  info += `${product.inStock ? "✅ متوفر" : "❌ غير متوفر"}`

  return info
}

// Enhanced rule-based response generator
function generateRuleBasedResponse(intent, products, message) {
  switch (intent) {
    case "greeting":
      return `🌟 **مرحباً بك في متجرنا!** 🌟

أهلاً وسهلاً! أنا مساعدك الذكي هنا لمساعدتك في العثور على أفضل المنتجات.

**يمكنني مساعدتك في:**
🔍 البحث عن المنتجات
🏷️ عرض العروض والخصومات  
⭐ المنتجات المميزة
📂 استعراض الفئات

**كيف يمكنني مساعدتك اليوم؟**`

    case "search":
      if (products.length === 0) {
        return `🔍 **نتائج البحث**

عذراً، لم أجد منتجات مطابقة لبحثك.

**جرب البحث عن:**
• Carhartt Baggy Pants
• قمصان
• أحذية رياضية
• إكسسوارات

أو اكتب اسم المنتج مباشرة!`
      }

      let searchResponse = `🔍 **نتائج البحث** (${products.length} منتج)\n\n`

      products.slice(0, 3).forEach((product, index) => {
        searchResponse += `**${index + 1}.** ${formatProductInfo(product)}\n\n`
      })

      if (products.length > 3) {
        searchResponse += `📋 **وهناك ${products.length - 3} منتج آخر متاح!**\n\nهل تريد رؤية المزيد؟`
      }

      return searchResponse

    case "sale":
      if (products.length === 0) {
        return `🔥 **العروض والخصومات**

لا توجد عروض متاحة حالياً 😔

**لكن لا تقلق!**
• تابعنا للحصول على أحدث العروض
• اشترك في النشرة الإخبارية
• تحقق من المنتجات المميزة

**هل تريد رؤية المنتجات المميزة؟**`
      }

      let saleResponse = `🔥 **العروض الحالية** (${products.length} منتج)\n\n`

      products.forEach((product, index) => {
        const discount = Math.round(((product.price - product.salePrice) / product.price) * 100)
        saleResponse += `**${index + 1}.** ${formatProductInfo(product)}\n💸 **خصم ${discount}%**\n\n`
      })

      saleResponse += `⏰ **أسرع! العروض محدودة**`

      return saleResponse

    case "featured":
      if (products.length === 0) {
        return `⭐ **المنتجات المميزة**

لا توجد منتجات مميزة حالياً 🌟

**لكن لدينا منتجات رائعة أخرى!**
• منتجات جديدة
• عروض خاصة
• أكثر المنتجات مبيعاً

**هل تريد البحث عن شيء محدد؟**`
      }

      let featuredResponse = `⭐ **منتجاتنا المميزة** (${products.length} منتج)\n\n`

      products.forEach((product, index) => {
        featuredResponse += `**${index + 1}.** ${formatProductInfo(product)}\n📝 ${product.description}\n\n`
      })

      featuredResponse += `🌟 **هذه أفضل اختياراتنا لك!**`

      return featuredResponse

    case "categories":
      const categories = products
      if (categories.length === 0) {
        return `📂 **فئات المنتجات**

عذراً، لا توجد فئات متاحة حالياً 📂

**تحقق لاحقاً للحصول على:**
• فئات جديدة
• منتجات محدثة
• تصنيفات أفضل`
      }

      let categoriesResponse = `📚 **الفئات المتاحة في متجرنا**\n\n`

      categories.forEach((cat, i) => {
        categoriesResponse += `**${i + 1}.** ${cat}\n`
      })

      categoriesResponse += `\n🔍 **يمكنك البحث في أي فئة تهمك!**`

      return categoriesResponse

    case "help":
      return `🤖 **كيف يمكنني مساعدتك؟**

**الخدمات المتاحة:**

🔍 **البحث عن المنتجات**
• اكتب اسم المنتج (مثل: "Carhartt pants")
• ابحث بالفئة (مثل: "قمصان")

🏷️ **العروض والخصومات**
• اكتب "عروض" أو "خصومات"

⭐ **المنتجات المميزة**
• اكتب "مميز" أو "اقتراح"

📂 **الفئات**
• اكتب "فئات" أو "أقسام"

**فقط اكتب ما تريد البحث عنه!**`

    default:
      if (products.length > 0) {
        let defaultResponse = `🛍️ **وجدت بعض المنتجات التي قد تهمك!**\n\n`

        products.slice(0, 2).forEach((product, index) => {
          defaultResponse += `**${index + 1}.** ${formatProductInfo(product)}\n\n`
        })

        defaultResponse += `**هل تريد المزيد من التفاصيل؟**`

        return defaultResponse
      }

      return `👋 **أهلاً بك!**

أنا مساعدك الذكي في متجر الملابس 🛍️

**يمكنك سؤالي عن:**
• المنتجات المتاحة
• العروض والخصومات
• المنتجات المميزة
• أي شيء تريد معرفته

**كيف يمكنني مساعدتك؟**`
  }
}

// Function to call AI with fallback
async function callAI(prompt, intent, products, message) {
  try {
    switch (AI_PROVIDER) {
      case "cohere":
        if (COHERE_API_KEY) {
          return await callCohere(prompt)
        }
        break
      case "together":
        if (TOGETHER_API_KEY) {
          return await callTogether(prompt)
        }
        break
      case "groq":
        if (GROQ_API_KEY) {
          return await callGroq(prompt)
        }
        break
    }
  } catch (error) {
    console.log(`${AI_PROVIDER} not available, using rule-based responses`)
  }

  return generateRuleBasedResponse(intent, products, message)
}

// Main chat route
router.post("/", async (req, res) => {
  try {
    const { message } = req.body

    if (!message || message.trim() === "") {
      return res.status(400).json({ reply: "الرجاء إدخال رسالة صحيحة." })
    }

    const intent = detectIntent(message)
    let context = ""
    let products = []

    // Handle different intents
    switch (intent) {
      case "search":
        const searchTerms = message.replace(/(اعرض|أرني|ابحث|show|search|find|لي|me)/gi, "").trim()
        products = await searchProducts(searchTerms)
        context = `البحث عن: ${searchTerms}`
        break

      case "sale":
        products = await getSaleProducts()
        context = "المنتجات المخفضة"
        break

      case "featured":
        products = await getFeaturedProducts()
        context = "المنتجات المميزة"
        break

      case "categories":
        const categories = await getCategories()
        context = "فئات المنتجات"
        products = categories
        break

      case "greeting":
        context = "ترحيب بالعميل"
        break

      default:
        products = await searchProducts(message)
        context = products.length > 0 ? "منتجات ذات صلة" : "استفسار عام"
    }

    // Create AI prompt if using AI
    const systemPrompt = `أنت مساعد ذكي لمتجر ملابس. السياق: ${context}

المنتجات المتاحة:
${products.map((p) => `- ${p.name}: ${p.price} دينار، الألوان: ${p.colors?.join(", ") || "غير محدد"}، المقاسات: ${p.sizes?.join(", ") || "غير محدد"}`).join("\n")}

تعليمات:
- استخدم اللغة العربية
- نظم الرد بشكل جميل مع الرموز التعبيرية
- اجعل الرد مفيداً وجذاباً
- لا تتجاوز 200 كلمة

سؤال العميل: ${message}`

    const aiResponse = await callAI(systemPrompt, intent, products, message)

    res.json({ reply: aiResponse.trim() })
  } catch (error) {
    console.error("Error in chat route:", error)

    const intent = detectIntent(req.body.message || "")
    let fallbackReply = "🤖 عذراً، حدث خطأ في النظام. يمكنك تجربة السؤال مرة أخرى."

    if (intent === "greeting") {
      fallbackReply = "👋 مرحباً بك في متجرنا! كيف يمكنني مساعدتك اليوم؟"
    } else if (intent === "search") {
      fallbackReply = '🔍 يمكنك البحث عن المنتجات باستخدام الكلمات المفتاحية مثل "pants" أو "Carhartt".'
    }

    res.json({ reply: fallbackReply })
  }
})

// Health check route
router.get("/health", async (req, res) => {
  const status = {
    status: "OK",
    ai_provider: AI_PROVIDER,
    available_providers: [],
  }

  if (COHERE_API_KEY) status.available_providers.push("cohere")
  if (TOGETHER_API_KEY) status.available_providers.push("together")
  if (GROQ_API_KEY) status.available_providers.push("groq")

  status.available_providers.push("rule_based")

  res.json(status)
})

module.exports = router
