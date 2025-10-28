const BASE_URL = "https://462557-37ddc8fcc64c4f3e98d815dbc5b0cc59-3-latest.app.mgx.dev/api";

export const loginUser = async (email, password) => {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Login error:", err);
    return { success: false, message: "Network error" };
  }
};
