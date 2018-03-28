require "octokit_utils"

desc "Update, commit and push a browserslist-stats.json file"
task update_push_new_stats: :environment do
  filename = "browserslist-stats.json"
  content = { foo: "bar" }
  commit_msg = "chore: update #{ filename }"

  config = Config.first
  repo = config.repo
  branch = config.base

  client = OctokitUtils.new_client(config.installation_id)
  file = OctokitUtils.get_file(client, repo, filename, branch: branch)

  # TODO: Compare existing file with new file

  client.create_contents(repo, filename, commit_msg, content.to_json, branch: branch, sha: file[:sha])
  Rails.logger.info "Stats file committed and pushed successfully for ##{ config.id }."
end
