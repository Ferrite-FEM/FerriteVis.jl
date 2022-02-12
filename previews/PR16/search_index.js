var documenterSearchIndex = {"docs":
[{"location":"api/#API-Reference","page":"API Reference","title":"API Reference","text":"","category":"section"},{"location":"api/","page":"API Reference","title":"API Reference","text":"On this page the docs of the provided functions are listed","category":"page"},{"location":"api/","page":"API Reference","title":"API Reference","text":"FerriteVis.solutionplot\nFerriteVis.wireframe\nFerriteVis.arrows\nFerriteVis.surface\nFerriteVis.ferriteviewer\nFerriteVis.update!","category":"page"},{"location":"api/#FerriteVis.solutionplot","page":"API Reference","title":"FerriteVis.solutionplot","text":"solutionplot(plotter::MakiePlotter; kwargs...)\nsolutionplot(dh::AbstractDofHandler, u::Vector; kwargs...)\nsolutionplot!(plotter::MakiePlotter; kwargs...)\nsolutionplot!(dh::AbstractDofHandler, u::Vector; kwargs...)\n\nSolutionplot produces the classical contour plot onto the finite element mesh. Most important keyword arguments are:\n\nfield::Symbol=:default representing the field which gets plotted, defaults to the first field in the dh.\ndeformation_field::Symbol=:default field that transforms the mesh by the given deformation, defaults to no deformation\nprocess::Function=postprocess function to construct nodal scalar values from a vector valued problem\ncolormap::Symbol=:cividis\ndeformation_scale=1.0\nshading=false\nscale_plot=false\ntransparent=false\n\n\n\n\n\n","category":"function"},{"location":"api/#FerriteVis.wireframe","page":"API Reference","title":"FerriteVis.wireframe","text":"wireframe(plotter::MakiePlotter; kwargs...)\nwireframe(dh::AbstractDofHandler, u::Vector; kwargs...)\nwireframe(grid::AbstractGrid; kwargs...)\nwireframe!(plotter::MakiePlotter; kwargs...)\nwireframe!(dh::AbstractDofHandler, u::Vector; kwargs...)\nwireframe!(grid::AbstractGrid; kwargs...)\n\nPlots the finite element mesh, optionally labels it and transforms it if a suitable deformation_field is given.\n\nplotnodes::Bool=true plots the nodes as circles/spheres\nstrokewidth::Int=2 how thick faces/edges are drawn\ncolor::Symbol=theme(scene,:linecolor) color of the faces/edges and nodes\nmarkersize::Int=30 size of the nodes\ndeformation_field::Symbol=:default field that transforms the mesh by the given deformation, defaults to no deformation\nnodelables=false global node id labels\nnodelabelcolor=:darkblue\ncelllabels=false global cell id labels\ncelllabelcolor=:darkred\ntextsize::Int=15 size of the label's text\nvisible=true\nscale=1\n\n\n\n\n\n","category":"function"},{"location":"api/#FerriteVis.arrows","page":"API Reference","title":"FerriteVis.arrows","text":"arrows(plotter::MakiePlotter; kwargs...)\narrows(dh::AbstractDofHandler, u::Vector; kwargs...)\narrows!(plotter::MakiePlotter; kwargs...)\narrows!(dh::AbstractDofHandler, u::Vector; kwargs...)\n\nAt every node position a arrows is drawn, where the arrow tip ends at the node. Only works in dim >=2. If a color is specified the arrows are unicolored. Otherwise the color corresponds to the magnitude, or any other scalar value based on the process function.\n\narrowsize = 0.08\nnormalize = true\nfield = :default\ncolor = :default\ncolormap = :cividis\nprocess=postprocess\nlengthscale = 1f0\n\n\n\n\n\n","category":"function"},{"location":"api/#FerriteVis.surface","page":"API Reference","title":"FerriteVis.surface","text":"surface(plotter::MakiePlotter; kwargs...)\nsurface(dh::AbstractDofHandler, u::Vector; kwargs...)\nsurface!(plotter::MakiePlotter; kwargs...)\nsurface!(dh::AbstractDofHandler, u::Vector; kwargs...)\n\nUses the given field and plots the scalar values as a surface. If it's a vector valued problem, the nodal vector values are transformed to a scalar based on process which defaults to the magnitude. Only availble in dim=2.\n\nfield = :default\nprocess = postprocess\nscale_plot = false\nshading = false\ncolormap = :cividis\n\n\n\n\n\n","category":"function"},{"location":"api/#FerriteVis.ferriteviewer","page":"API Reference","title":"FerriteVis.ferriteviewer","text":"ferriteviewer(plotter::MakiePlotter)\nferriteviewer(plotter::MakiePlotter, u_history::Vector{Vector{T}}})\n\nConstructs a viewer with a solutionplot, Colorbar as well as sliders,toggles and menus to change the current view. If the second dispatch is called a timeslider is added, in order to step through a set of solutions obtained from a simulation.\n\n\n\n\n\n","category":"function"},{"location":"api/#FerriteVis.update!","page":"API Reference","title":"FerriteVis.update!","text":"FerriteVis.update!(plotter::MakiePlotter, u::Vector)\n\nUpdates the Observable plotter.u and thereby, triggers the plot to update.\n\n\n\n\n\n","category":"function"},{"location":"atopics/#Advanced-Topics","page":"Advanced Topics","title":"Advanced Topics","text":"","category":"section"},{"location":"atopics/#Live-plotting","page":"Advanced Topics","title":"Live plotting","text":"","category":"section"},{"location":"atopics/","page":"Advanced Topics","title":"Advanced Topics","text":"Plotting while a computational heavy simulation is performed can be easily achieved with FerriteVis.jl. Every plotter object of type MakiePlotter holds a property called u which is a so called Observable. If an Observable changes, all its dependencies are triggered to change as well. So, all we need to do is to update the observable plotter.u. For this purpose the function FerriteVis.update! is provided. It takes a plotter:MakiePlotter and a new solutiuon vector u_new and updates plotter.u, thereby all open plots called with plotter are updated.","category":"page"},{"location":"atopics/","page":"Advanced Topics","title":"Advanced Topics","text":"A summary of the needed steps for live plotting:","category":"page"},{"location":"atopics/","page":"Advanced Topics","title":"Advanced Topics","text":"Create a plotter before your time stepping begins\nCall a plot or the ferriteviewer and save the return in a variable, e.g. fig\ndisplay(fig) in order to force the plot/viewer to pop up, even if its called inside a function body\nFerriteVis.update!(plotter,u_new) where u_new corresponds to your new solution of the time step","category":"page"},{"location":"atopics/","page":"Advanced Topics","title":"Advanced Topics","text":"As an illustrative example, let's consider a slightly modified plasticity example of Ferrite.jl. For the full source code, please refer to the link. In the following code we only highlight the necessary changes.","category":"page"},{"location":"atopics/","page":"Advanced Topics","title":"Advanced Topics","text":"function solve(liveplotting=false)\n    # set up your problem \n    # lots of code\n    dh = create_dofhandler(grid, interpolation) #helper function from script file\n    n_dofs = ndofs(dh)  # total number of dofs\n    u  = zeros(n_dofs)\n\n    if liveplotting\n        ####### Here we take care of the conceptual steps 1, 2 and 3 #######\n        plotter = MakiePlotter(dh,u)\n        fig = ferriteviewer(plotter)\n        display(fig)\n        ####################################################################\n    end\n    \n    Δu = zeros(n_dofs)  # displacement correction\n    r = zeros(n_dofs)   # residual\n    K = create_sparsity_pattern(dh); # tangent stiffness matrix\n\n    nqp = getnquadpoints(cellvalues)\n    states = [[MaterialState() for _ in 1:nqp] for _ in 1:getncells(grid)]\n\n    # Newton-Raphson loop\n    NEWTON_TOL = 1 # 1 N\n\n    for timestep in 1:n_timesteps\n        while true; newton_itr += 1\n\n            if newton_itr > 8\n                error(\"Reached maximum Newton iterations, aborting\")\n                break\n            end\n            K, r = doassemble(cellvalues, facevalues, K, grid, dh, material, u,\n                             states, traction);\n            norm_r = norm(r[Ferrite.free_dofs(dbcs)])\n\n            if norm_r < NEWTON_TOL\n                break\n            end\n\n            apply_zero!(K, r, dbcs)\n            Δu = Symmetric(K) \\ r\n            u -= Δu\n        end\n        \n        if liveplotting\n            ####### Step 4 updating the current solution vector in plotter ####### \n            FerriteVis.update!(plotter,u)\n            ###################################################################### \n            sleep(0.1)\n        end\n\n        # Update all the material states after we have reached equilibrium\n        for cell_states in states\n            foreach(update_state!, cell_states)\n        end\n        u_max[timestep] = max(abs.(u)...) # maximum displacement in current timestep\n    end\n\n    # postprocessing\n    # lots of code\n    return u, dh, traction_magnitude\nend\n\nu, dh, traction_magnitude = solve();","category":"page"},{"location":"atopics/","page":"Advanced Topics","title":"Advanced Topics","text":"Note that we create plotter::MakiePlotter object before the time stepping begins, as well as calling ferriteviewer on the plotter. The next function call is crucial to get the live plotting working. display(fig) forces the viewer to pop up, even if it's inside a function body. Now, the only missing piece is the FerriteVis.update! of the plotter, which happens directly after the Newton iteration. The result for this code looks like this:","category":"page"},{"location":"atopics/","page":"Advanced Topics","title":"Advanced Topics","text":"(Image: liveplot)","category":"page"},{"location":"atopics/","page":"Advanced Topics","title":"Advanced Topics","text":"Since the computational load of one time step is in this example too low, the plotter would just update all the time and likely never display something, so we artificially increase the load of one time step by sleeping for 0.1s.","category":"page"},{"location":"atopics/","page":"Advanced Topics","title":"Advanced Topics","text":"If you don't need the full viewer as a live plot, you can of course call instead solutionplot (or any other plot/plot combination) with appropriate keyword arguments to only have a specific live plot. This can be beneficial performancewise.","category":"page"},{"location":"#FerriteVis.jl","page":"Home","title":"FerriteVis.jl","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"FerriteVis.jl is a small package to visualize your Ferrite.jl results. Currently all Makie backends are supported and thus, you can visualize your results in a GLMakie window, inside Pluto/Jupyter notebooks via WGLMakie and produce nice vector graphics with CairoMakie.","category":"page"},{"location":"","page":"Home","title":"Home","text":"In the future this package tries to adapt also other plotting packages, such as Plots.jl and PGFPlotsX.jl. Contributions are highly welcome.","category":"page"},{"location":"#Getting-Started","page":"Home","title":"Getting Started","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Install FerriteVis.jl with the in-built package manager of Julia","category":"page"},{"location":"","page":"Home","title":"Home","text":"pkg> add FerriteVis","category":"page"},{"location":"","page":"Home","title":"Home","text":"Do your computation with Ferrite.jl and save the used DofHandler and solution vector into a variable. Pass those two variables into the MakiePlotter constructor","category":"page"},{"location":"","page":"Home","title":"Home","text":"plotter = MakiePlotter(dh,u)","category":"page"},{"location":"","page":"Home","title":"Home","text":"Now, you can use solutionplot, wireframe, arrows, surface or the viewer via ferriteviewer.  Note that the mutating solutionplot!, wireframe!, arrows! and surface! are available as well.","category":"page"},{"location":"#Unique-features","page":"Home","title":"Unique features","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"This package offers a set of unique features that are not easily reproducible with other export options of Ferrite.jl:","category":"page"},{"location":"","page":"Home","title":"Home","text":"FerriteVis.solutionplot FE solution contour plot on arbitrary finite element mesh (in Makie called mesh plots)\nFerriteVis.ferriteviewer viewer with toggles and menus that update the plot\nFerriteVis.wireframe plots the finite element mesh and optionally labels nodes and cells\nFerriteVis.arrows - also called quiver plots, in paraview glyph filter\nFerriteVis.surface 2D solutions in 3D space as surface, in paraview warp by scalar filter\nsynchronous plotting while your simulation runs with any of the above listed options\nmutating versions of the above listed functions (except for the viewer)\ndeformed plots available for solutionplot and wireframe\nfull integration into the Makie ecosystem, e.g. themes, layouts etc. \nGPU powered plotting with GLMakie.jl, jupyter/pluto notebook plotting with WGLMakie.jl and vector graphics with CairoMakie.jl","category":"page"},{"location":"tutorial/#Tutorial","page":"Tutorial","title":"Tutorial","text":"","category":"section"},{"location":"tutorial/#Solve-a-Boundary-Value-Problem","page":"Tutorial","title":"Solve a Boundary Value Problem","text":"","category":"section"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"Start with solving a boundary value problem as you would usually do with Ferrite. It is crucial that you safe your used DofHandler and solution vector because we need to pass those objects to MakiePlotter.","category":"page"},{"location":"tutorial/#Plot-your-results","page":"Tutorial","title":"Plot your results","text":"","category":"section"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"tip: Plotting Functions\nCurrently, FerriteVis.solutionplot, FerriteVis.wireframe, FerriteVis.surface, FerriteVis.arrows and their mutating analogues with ! are defined for MakiePlotter. Due to the nature of the documentation we need WGLMakie, however, you can simply exchange any WGLMakie call by GLMakie.","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"import JSServe # hide\nJSServe.Page(exportable=true, offline=true) # hide","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"You can start by plotting your mesh","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"import FerriteVis\nusing Ferrite\nimport WGLMakie #activating the backend, switch to GLMakie or CairoMakie (for 2D) locally\nWGLMakie.set_theme!(resolution=(800, 400)) # hide\n\ngrid = generate_grid(Hexahedron,(3,3,3))\nFerriteVis.wireframe(grid,markersize=50,strokewidth=2)","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"FerriteVis.jl also supports showing labels for Ferrite.AbstractGrid entities, such as node- and celllabels.","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"grid = generate_grid(Quadrilateral,(3,3))\nFerriteVis.wireframe(grid,markersize=5,strokewidth=1,nodelabels=true,celllabels=true)","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"If you solve some boundary value problem with Ferrite.jl keep in mind to safe your dh::DofHandler and solution vector u::Vector{T} in some variable. With them, we create the MakiePlotter struct that dispatches on the plotting functions.","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"include(\"ferrite-examples/incompressible-elasticity.jl\") #defines variables dh and u\n\nplotter = FerriteVis.MakiePlotter(dh,u)\nFerriteVis.arrows(plotter)","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"Per default, all plotting functions grab the first field in the DofHandler, but of course you can plot a different field as well. The next plot will show the pressure instead of the displacement","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"FerriteVis.solutionplot(plotter,field=:p)","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"For certain 2D problems it makes sense to visualize the result as a surface plot. To showcase the combination with the mutating versions of the plotting functions, the solutionplot function is plotted below the surface plot","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"FerriteVis.surface(plotter)\nFerriteVis.solutionplot!(plotter,colormap=:magma)\nWGLMakie.current_figure()","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"However, in structural mechanics we often would like to see the deformed configuration, which can be achieved by providing a deformation_field::Symbol as a keyword argument.","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"include(\"ferrite-examples/plasticity.jl\") #only defines solving function\nu, dh = solve()\nplotter = FerriteVis.MakiePlotter(dh,u)\n\nFerriteVis.solutionplot(plotter,colormap=:thermal,deformation_field=:u)\nFerriteVis.wireframe!(plotter,deformation_field=:u,markersize=25,strokewidth=1)\nWGLMakie.current_figure()","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"Further, this package provides an interactive viewer that you can call with ferriteviewer(plotter) and ferriteviewer(plotter,u_history) for time dependent views, respectively. If you want to live plot your solution while solving some finite element system, consider to take a look at the advanced topics page.","category":"page"}]
}
