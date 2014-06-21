class StaticPagesController < ApplicationController
  def home
  end

  def get_data
  	render layout: false
  end
end
