import axios from "axios";

const API_KEY = process.env.CONVERTKIT_API_KEY;
const FORM_ID = process.env.CONVERTKIT_FORM_ID;
const BASE_URL = "https://api.convertkit.com/v3";
const email_required_message = "יש להכניס כתובת אימייל";
const error_message = `אופס! משהו השתבש. אנא נסה שוב.`;
const success_message = `האימייל שלך נוסף בהצלחה לרשימת התפוצה!`;

export async function POST(request) {
  const body = await request.json();
  const email = body.email;

  if (!email) {
    return new Response(JSON.stringify({ message: email_required_message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const url = `${BASE_URL}/forms/${FORM_ID}/subscribe`;
    const data = {
      api_key: API_KEY,
      email: email,
    };

    const axiosResponse = await axios.post(url, data, {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });

    if (axiosResponse.status === 200) {
      return new Response(JSON.stringify({ message: success_message }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ message: error_message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ message: error_message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
