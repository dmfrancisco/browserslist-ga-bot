require_relative 'boot'

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Bot
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 5.1

    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    config.action_controller.per_form_csrf_tokens = true

    # Error handling with Sentry
    if Rails.env.production?
      Raven.configure do |config|
        config.dsn = 'https://d0123e9a81a94d8d8eca78d6f8efd7fb:701c2648c8cf48c99eea1da28265e3d1@sentry.io/227267'
      end
    end
  end
end
