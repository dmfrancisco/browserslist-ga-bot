class ConfigsController < ApplicationController
  def new
  end

  def create
    config = Config.new

    tokens = JS.get_google_tokens params[:auth_code]

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
end
