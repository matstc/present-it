class HomeController < ApplicationController
  def index
  end

  def upload
    unless params[:file].original_filename.end_with? ".md" or
           params[:file].original_filename.end_with? ".markdown"

      @error = "Sorry. We only support markdown files."
      render layout: false, status: 400
      return
    end

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
