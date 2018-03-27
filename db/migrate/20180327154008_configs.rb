class Configs < ActiveRecord::Migration[5.1]
  def change
    create_table :configs do |t|
      t.integer :installation_id, null: false
      t.string :repo, null: false
      t.string :base, null: false
    end
  end
end
