class Config < ApplicationRecord
  DATE_PERIODS = [30, 60, 90]

  validates :ga_date_period, inclusion: DATE_PERIODS
end
