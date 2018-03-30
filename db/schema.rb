# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20180330200621) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "configs", force: :cascade do |t|
    t.string "ga_access_token", null: false
    t.string "ga_refresh_token", null: false
    t.string "ga_expiry_date", null: false
    t.string "ga_account_id", null: false
    t.string "ga_web_property_id", null: false
    t.string "ga_profile_id", null: false
    t.integer "ga_date_period", null: false
    t.string "installation_id", null: false
    t.string "repo", null: false
    t.string "base", null: false
    t.string "email", null: false
    t.datetime "committed_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "events", force: :cascade do |t|
    t.string "kind", null: false
    t.string "delivery_id", null: false
    t.string "installation_id", null: false
    t.string "action", null: false
    t.json "payload", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

end
