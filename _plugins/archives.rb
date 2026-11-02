# frozen_string_literal: true

# Category and tag pages keep the previous public URLs:
# /categories/<slug>/ and /tags/<slug>/. Slugs are lowercase with
# spaces turned into hyphens; Chinese names stay as-is.

module BoboArchives
  module Slug
    def self.call(name)
      name.to_s.strip.downcase.gsub(/[[:space:]]+/, "-")
    end
  end

  module Filters
    def archive_slug(input)
      Slug.call(input)
    end
  end

  class Page < Jekyll::Page
    def initialize(site, dir, kind, name)
      @site = site
      @base = site.source
      @dir = dir
      @name = "index.html"

      process(@name)
      self.data = {
        "layout" => "archive_list",
        "title" => name,
        "archive_kind" => kind,
        "archive_name" => name,
        "description" => kind == "category" ? "#{name} 分类下的文章" : "标签「#{name}」下的文章",
        "permalink" => "/#{dir}/"
      }
      self.content = ""
    end
  end

  class Generator < Jekyll::Generator
    safe true
    priority :low

    def generate(site)
      seen = {}
      site.categories.each_key { |name| add(site, seen, "categories", "category", name) }
      site.tags.each_key { |name| add(site, seen, "tags", "tag", name) }
    end

    def add(site, seen, folder, kind, name)
      slug = Slug.call(name)
      if slug.empty?
        Jekyll.logger.warn("Archives:", "skipped a blank #{kind} name")
        return
      end

      key = "#{folder}/#{slug}"
      if seen[key]
        Jekyll.logger.warn("Archives:", "duplicate #{kind} slug '#{slug}'")
        return
      end

      seen[key] = true
      site.pages << Page.new(site, key, kind, name)
    end
  end
end

Liquid::Template.register_filter(BoboArchives::Filters)
