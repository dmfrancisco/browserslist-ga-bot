require "octokit_utils"

desc "Update, commit and push a browserslist-stats.json file"
task update_push_new_stats: :environment do
  browserslist_stats_filename = "browserslist-stats.json"
  browserslist_stats_content = { foo: "bar" }.to_json
  commit_msg = "chore: update browserslist-stats.json"

  config = Config.first

  # The preview version of the Integrations API is not yet suitable for production use.
  # You can avoid this message by supplying an appropriate media type in the 'Accept' request header.
  default_media_type = Octokit::Preview::PREVIEW_TYPES[:integrations]

  jwt_client = Octokit::Client.new(bearer_token: OctokitUtils.new_jwt_token)

  app_token = jwt_client.create_installation_access_token(config.installation_id, accept: default_media_type)
  access_token = app_token[:token]

  client = Octokit::Client.new(access_token: access_token)

  repo = config.repo
  base = config.base

  begin
    contents = client.contents(repo, path: browserslist_stats_filename)

    content = JSON.parse Base64.decode64(contents.content)
    sha = contents[:sha]
  rescue Octokit::NotFound => e
    Rails.logger.info "Stats file doesn't exist yet, a new one will be created for ##{ config.id }..."

    content = {}
    sha = nil
  end

  client.create_contents(repo, browserslist_stats_filename, commit_msg, browserslist_stats_content, branch: base, sha: sha)
  Rails.logger.info "Stats file committed and pushed successfully for ##{ config.id }."
end
