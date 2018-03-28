module JS
  extend self

  def get_google_tokens(auth_code)
    JSON.parse `#{ bin } scripts/get_google_tokens.js #{ auth_code }`
  end

  def refresh_google_tokens(access_token, refresh_token)
    JSON.parse `#{ bin } scripts/refresh_google_tokens.js #{ access_token } #{ refresh_token }`
  end

  private

  def bin
    Rails.env.dev? ? "foreman run node" : "node"
  end
end
