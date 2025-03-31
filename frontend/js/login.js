document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  console.log("Logging in with:", email, password); // Debug log

  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    console.log("Response status:", response.status); // Debug log
    const data = await response.json();
    console.log("Response data:", data); // Debug log

    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      if (data.role === "individual") window.location.href = "seller.html";
      else if (data.role === "collector") window.location.href = "buyer.html";
      else if (data.role === "business") window.location.href = "business.html";
    } else {
      alert(data.msg || "Login failed. Please check your credentials.");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("Something went wrong. Please try again later.");
  }
});
