module OctokitUtils
  extend self

  def new_client(installation_id)
    jwt_client = Octokit::Client.new(bearer_token: OctokitUtils.new_jwt_token)
    app_token = jwt_client.create_installation_access_token(installation_id, accept: default_media_type)
    access_token = app_token[:token]

    Octokit::Client.new(access_token: access_token)
  end

  def get_file(client, repo, filename, branch: nil)
    begin
      contents = client.contents(repo, path: filename, branch: branch)
      content = JSON.parse Base64.decode64(contents.content)
      sha = contents[:sha]
    rescue Octokit::NotFound => e
      Rails.logger.info "File doesn't exist yet, a new one will be created..."
      content = {}
      sha = nil
    end

    return {
      content: content,
      sha: sha,
    }
  end

  # The preview version of the Integrations API is not yet suitable for production use.
  # You can avoid this message by supplying an appropriate media type in the 'Accept' request header.
  def default_media_type
    Octokit::Preview::PREVIEW_TYPES[:integrations]
  end

  def new_jwt_token(private_pem = ENV["GITHUB_PRIVATE_KEY"], app_id = Rails.application.secrets.github_app_id)
    private_key = OpenSSL::PKey::RSA.new(private_pem)

    payload = {}.tap do |opts|
      opts[:iat] = Time.now.to_i # Issued at time
      opts[:exp] = opts[:iat] + 300 # JWT expiration time is 5 minutes from issued time
      opts[:iss] = app_id # Integration's GitHub identifier
    end

    JWT.encode(payload, private_key, "RS256")
  end
end
