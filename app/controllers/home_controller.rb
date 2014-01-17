class HomeController < ApplicationController
  def index
  end

  def upload
    hash = "#{SecureRandom.hex 4}.md"
    params[:file].original_filename = hash
    uploader = PresentationUploader.new
    uploader.store! params[:file]
    @url = presentation_url(hash)

    render layout: false
  end

  def show
    uploader = PresentationUploader.new
    uploader.retrieve_from_store! "#{params[:id]}.#{params[:format]}"
    out = present('Present It', content_of(uploader.file.file))

    render inline: out, content_type: 'text/html', layout: false
  end
end
