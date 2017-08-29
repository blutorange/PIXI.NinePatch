require 'chunky_png'
require 'json'

def get_black(rowOrColumn, size)
    left = rowOrColumn.index{|x|x!=0};
    right = rowOrColumn.rindex{|x|x!=0};
    return [left, right]
end

def create_entry(image, basename, index, frames, interval_x, interval_y)
    w = interval_x[1] - interval_x[0] + 1
    h = interval_y[1] - interval_y[0] + 1
    cx1 = interval_x[2] || 0
    cx2 = interval_x[3] || 0
    cy1 = interval_y[2] || 0
    cy2 = interval_y[3] || 0
    frame = {
        "frame" => {
            "x" => interval_x[0]+cx1,
            "y" => interval_y[0]+cy1,
            "w" => w-cx1-cx2,
            "h" => h-cy1-cy2
        },
        "rotated" => false,
        "trimmed" => false,
        "spriteSourceSize" => {
            "x" => 0,
            "y" => 0,
            "w" => w,
            "h" => h
        },
        "sourceSize" => {
            "w" => w,
            "h" => h
        }
    }
    frames["#{basename}_#{index}.png"] = frame;
end

if (ARGV.length < 1)
    puts "Usage: ruby 9patch2atlas.rb ninepatch.9.png [pretty]"
    puts "Output is the input file with the extension replaced by json."
    puts "If pretty is given, pretty formats the json"
    exit
end

file = ARGV.shift
pretty = ARGV.shift == "pretty"
basename = File.basename(file, ".png")
out = File.join(File.dirname(file), basename + ".json")
image = ChunkyPNG::Image.from_file(file)
frames = {}

row0 = get_black(image.row(0), image.width)
col0 = get_black(image.column(0), image.height)

rown = get_black(image.row(image.height-1), image.width)
coln = get_black(image.column(image.width-1), image.height)

x00 = [0,row0[0]-1,1,0]
x10 = [row0[0], row0[1],0,0]
x20 = [row0[1]+1, image.width-1,0,1]
y00 = [0,col0[0]-1,1,0]
y10 = [col0[0], col0[1],0,0]
y20 = [col0[1]+1, image.height-1,0,1]

x1n = [rown[0], rown[1]]
y1n = [coln[0], coln[1]]

# top left
create_entry(image, basename, 1, frames, x00, y00)
# top middle
create_entry(image, basename, 2, frames, x10, y00)
# top right
create_entry(image, basename, 3, frames, x20, y00)

# middle left
create_entry(image, basename, 4, frames, x00, y10)
# top middle
create_entry(image, basename, 5, frames, x10, y10)
# top right
create_entry(image, basename, 6, frames, x20, y10)

# bottom left
create_entry(image, basename, 7, frames, x00, y20)
# bottom middle
create_entry(image, basename, 8, frames, x10, y20)
# bottom right
create_entry(image, basename, 9, frames, x20, y20)

atlas = {
    "frames" => frames,
    "meta" => {
        "app" => "ruby",
        "version" => "1.0",
        "image" => "#{basename}.png",
        "format" => "RGBA8888",
        "size" => {
            "w" => image.width,
            "h" => image.height
        },
        "scale" => "1",
        "content" => {
            "x" => x1n[0],
            "y" => y1n[0],
            "w" => x1n[1]-x1n[0]+1,
            "h" => y1n[1]-y1n[0]+1
        }
    }
}

File.write(out, pretty ? JSON.pretty_generate(atlas) : JSON.generate(atlas))
