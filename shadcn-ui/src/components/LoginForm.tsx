import { loginUser } from "../api/auth";

const handleLogin = async (e) => {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;

  const result = await loginUser(email, password);
  if (result.success) {
    alert("Login successful!");
    // redirect user to dashboard
  } else {
    alert(`Login failed: ${result.message}`);
  }
};
