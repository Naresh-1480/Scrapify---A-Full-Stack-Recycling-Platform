document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("signupForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("Signup button clicked!");
  
      // Fetch input values
      const firstName = document.getElementById("firstName").value.trim();
      const lastName = document.getElementById("lastName").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const confirmPassword = document.getElementById("confirmPassword").value.trim();
  
      // Get selected user role
      const role = document.querySelector('input[name="userType"]:checked').value;
  
      console.log({ firstName, lastName, email, password, confirmPassword, role });
  
      // Validate passwords match
      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
  
      try {
        // Show loading spinner (optional)
        document.querySelector(".loader").classList.remove("hidden");
  
        const response = await fetch("http://localhost:5000/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firstName, lastName, email, password, role }),
        });
  
        const data = await response.json();
        console.log("Server Response:", data);
  
        // Hide loading spinner
        document.querySelector(".loader").classList.add("hidden");
  
        if (response.ok) {
          alert("Signup successful! Redirecting to login...");
          window.location.href = "login.html";
        } else {
          alert(data.msg || "Signup failed!");
        }
      } catch (error) {
        console.error("Error during signup:", error);
        alert("Something went wrong. Check console.");
      }
    });
  });
  