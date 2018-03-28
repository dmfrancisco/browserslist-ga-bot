class Configs < ActiveRecord::Migration[5.1]
  def change
    create_table :configs do |t|
      t.string :ga_access_token, null: false
      t.string :ga_refresh_token, null: false
      t.string :ga_expiry_date, null: false

      t.string :ga_account_id, null: false
      t.string :ga_web_property_id, null: false
      t.string :ga_profile_id, null: false
      t.integer :ga_date_period, null: false

      t.string :installation_id, null: false
      t.string :repo, null: false
      t.string :base, null: false

      t.string :email, null: false

      t.datetime :committed_at
      t.timestamps null: false
    end
  end
end
