Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  get "/setup", to: "configs#new", as: "config_setup"
  post "/setup", to: "configs#create"
  post "/event", to: "configs#event"

  root to: redirect("https://github.com/apps/browserslist-ga")
end
