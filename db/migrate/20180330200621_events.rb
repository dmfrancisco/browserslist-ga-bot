class Events < ActiveRecord::Migration[5.1]
  def change
    create_table :events do |t|
      t.string :kind, null: false
      t.string :delivery_id, null: false

      t.string :installation_id, null: false
      t.string :action, null: false
      t.json :payload, null: false

      t.timestamps null: false
    end
  end
end
