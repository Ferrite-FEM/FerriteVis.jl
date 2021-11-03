push!(LOAD_PATH,"../src/")
using Documenter, FerriteVis, WGLMakie

makedocs(sitename="FerriteVis",
         modules=[FerriteVis],
         authors="Maximilian Köhler",
         pages=["Home"=> "index.md",
                "Tutorial" => "tutorial.md",
                "API Reference" => "api.md",]
)

deploydocs(repo = "github.com/koehlerson/FerriteVis.jl.git",
           push_preview=true,)
