class ConfigsController < ApplicationController
  skip_before_action :verify_authenticity_token, only: :event
  before_action :verify_webhook_signature, only: :event
  before_action :require_xhr, only: :check_availability

  # User is redirected to the our page after installing the app
  def new
  end

  # User submits the form
  def create
    tokens = JS.get_google_tokens params[:auth_code]

    config = Config.new
    config.ga_access_token = tokens["access_token"]
    config.ga_refresh_token = tokens["refresh_token"]
    config.ga_expiry_date = Time.at(tokens["expiry_date"] / 1000.0)
    config.ga_account_id = params[:account_id]
    config.ga_web_property_id = params[:web_property_id]
    config.ga_profile_id = params[:profile_id]
    config.ga_date_period = params[:date_period].to_i
    config.installation_id = params[:installation_id]
    config.repo = params[:repo]
    config.base = params[:base]
    config.email = params[:email]
    config.save!

    render json: {}, status: 200
  end

  # The user is redirect and at around the same time a webhook comes in
  # Check if we have access to the specified repository
  def check_availability
    installation_id = params[:installation_id]
    repo = params[:repo]

    # We check the timestamp for extra security
    event = Event
      .where(installation_id: installation_id)
      .where(action: ["created", "added"]) # Either new installation or repository change on existing one
      .where("created_at > ?", 1.day.ago)
      .order(created_at: :desc)
      .first

    repositories = event.payload["repositories"] || event.payload["repositories_added"]
    available = repositories.map { |repo| repo["full_name"].downcase }.include? repo.downcase

    render json: { available: available }.to_json, status: 200
  end

  # Listen to GitHub webhook events and save them in the database
  def event
    event = Event.new
    event.kind = request.headers["X-GitHub-Event"]
    event.delivery_id = request.headers["X-GitHub-Delivery"]
    event.payload = JSON.parse request_body
    event.installation_id = event.payload["installation"]["id"]
    event.action = event.payload["action"]
    event.save!

    render json: {}, status: 200
  end

  private

  def require_xhr
    redirect_to "/" unless request.xhr?
  end

  # Validate that the request really comes from GitHub
  def verify_webhook_signature
    webhook_secret = Rails.application.secrets.github_webhook_secret
    expected_signature = "sha1=#{ OpenSSL::HMAC.hexdigest(OpenSSL::Digest.new("sha1"), webhook_secret, request_body) }"
    raise Bot::SignatureError if expected_signature != request.headers["X-Hub-Signature"]
  end

  def request_body
    @_request_body ||= (
      request.body.rewind
      request.body.read
    )
  end
end
