// src/utils/googleAuth.js

export async function handleGoogleLogin(googleToken, apiPost) {
  try {
    // Send the Google token to backend for verification
    const response = await apiPost("/api/user/google-auth", {
      token: googleToken,
    });

    return response;
  } catch (error) {
    throw new Error(error.body?.message || "Google login failed");
  }
}
