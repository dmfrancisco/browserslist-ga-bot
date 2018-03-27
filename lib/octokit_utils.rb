module OctokitUtils
  def self.new_jwt_token(private_pem = ENV["BOT_PRIVATE_KEY"], app_id = Rails.application.secrets.github_app_id)
    private_key = OpenSSL::PKey::RSA.new(private_pem)

    payload = {}.tap do |opts|
      opts[:iat] = Time.now.to_i # Issued at time
      opts[:exp] = opts[:iat] + 300 # JWT expiration time is 5 minutes from issued time
      opts[:iss] = app_id # Integration's GitHub identifier
    end

    JWT.encode(payload, private_key, "RS256")
  end
end
