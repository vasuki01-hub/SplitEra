export default function handler(req, res) { 
  try { 
    const secret = process.env
    res.status(200).json({ 
      message: "API working", 
      success: true , 
      data:secret 
    }) 
  } catch (error) { 
    res.status(500).json({ error: error.message }) 
  } 
}