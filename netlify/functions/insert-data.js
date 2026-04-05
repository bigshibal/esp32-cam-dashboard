exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method not allowed" })
      };
    }

    const data = JSON.parse(event.body);
    console.log("Received:", data);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        received: data
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
