export default function handler(req, res) {
  try {
    const secret = process.env.MY_SECRET

    res.status(200).json({
      message: "API working",
      success: true
    })

  } catch (error) {
    res.status(500).json({
      error: error.message
    })
  }
}