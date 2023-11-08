using FerriteViz, Ferrite
using Test

_test_tolerance(ip::Interpolation{<:Any,<:Any,1}) = 5e-1
_test_tolerance(ip::Interpolation) = 1e-6

struct MatrixValued <: Ferrite.FieldTrait end

function Ferrite.function_value(::MatrixValued, fe_v::Ferrite.Values{dim}, q_point::Int, u::AbstractVector) where {dim}
    n_base_funcs = Ferrite.getn_scalarbasefunctions(fe_v)
    length(u) == n_base_funcs*dim^2 || Ferrite.throw_incompatible_dof_length(length(u), n_base_funcs)
    @boundscheck Ferrite.checkquadpoint(fe_v, q_point)
    val = zero(Tensor{2, dim})
    
    @inbounds for I ∈ 1:n_base_funcs*dim^2
         # First flatten to vector
        i0, c0 = divrem(I - 1, dim^2)
        i = i0 + 1
        v = Ferrite.shape_value(fe_v, q_point, i)
    
        # Then compute matrix index
        ci0, cj0 = divrem(c0, dim)
        ci = ci0 + 1
        cj = cj0 + 1
        
        val += Ferrite.Tensor{2, dim}((k, l) -> k == ci && l == cj ? v*u[I] : zero(v))
    end

    return val
end

@testset "utility operations" begin
    # Check scalar problems
    for (num_elements_per_dim, geo, ip) ∈ [
                           (4,Triangle, Lagrange{2,RefTetrahedron,1}()),
                           (2,Triangle, Lagrange{2,RefTetrahedron,2}()),
                           (2,Triangle, Lagrange{2,RefTetrahedron,3}()),
                           (5,Tetrahedron, Lagrange{3,RefTetrahedron,1}()),
                           (3,Tetrahedron, Lagrange{3,RefTetrahedron,2}()),
                           (4,Quadrilateral, Lagrange{2,RefCube,1}()),
                           (2,Quadrilateral, Lagrange{2,RefCube,2}()),
                           (4,Hexahedron, Lagrange{3,RefCube,1}()),
                           (2,Hexahedron, Lagrange{3,RefCube,2}())
        ]
        @testset "scalar($num_elements_per_dim, $geo, $ip)" begin
            # Get solution
            dim = Ferrite.getdim(ip)
            grid = generate_grid(geo, ntuple(x->num_elements_per_dim, dim));

            dh = DofHandler(grid)
            add!(dh, :u, ip)
            close!(dh);

            u = Vector{Float64}(undef, ndofs(dh))
            f_ana(x) = sum(0.5 * x.^2)
            Ferrite.apply_analytical!(u, dh, :u, f_ana)

            @testset "solution fields" begin
                plotter = FerriteViz.MakiePlotter(dh,u)
                data = FerriteViz.transfer_solution(plotter,u,process=x->x)[:,1]
                visible_nodes = .!isnan.(data)# TODO add API
                @test all(isapprox.(data[visible_nodes], f_ana.(plotter.physical_coords[visible_nodes]); atol=_test_tolerance(ip)))
            end

            # Compute gradient/flux field
            @testset "gradient fields" begin
                (dh_grad, u_grad) = FerriteViz.interpolate_gradient_field(dh, u, :u)

                # Check gradient of solution
                qr = QuadratureRule{dim,Ferrite.getrefshape(ip)}(2) # TODO sample random point
                ip_geo = Ferrite.default_interpolation(geo)
                ip_grad = Ferrite.getfieldinterpolation(dh_grad, Ferrite.find_field(dh_grad, :gradient))
                cellvalues_grad = Ferrite.CellVectorValues(qr, ip_grad, ip_geo)
                for cell in CellIterator(dh_grad)
                    reinit!(cellvalues_grad, cell)
                    coords = getcoordinates(cell)
                    uₑ = @views u_grad[celldofs(cell)]
                    for q_point in 1:getnquadpoints(cellvalues_grad)
                        x = spatial_coordinate(cellvalues_grad, q_point, coords)
                        uₐₚₚᵣₒₓ = function_value(cellvalues_grad, q_point, uₑ)
                        uₐₙₐ = Tensors.gradient(f_ana, x)
                        @test all(isapprox.(uₐₙₐ, uₐₚₚᵣₒₓ;atol=_test_tolerance(ip)))
                    end
                end

                # Check for correct transfer
                plotter_grad = FerriteViz.MakiePlotter(dh_grad,u_grad)
                data_grad = FerriteViz.transfer_solution(plotter_grad,u_grad; field_name=:gradient, process=x->x)
                visible_nodes_grad = .!isnan.(data_grad)
                for i ∈ 1:size(data_grad, 1)
                    !visible_nodes_grad[i] && continue
                    @test all(isapprox.(Vec{dim}(data_grad[i,:]), Tensors.gradient(f_ana, Vec{dim}(plotter_grad.physical_coords[i])); atol=_test_tolerance(ip)))
                end
            end
        end

        @testset "vector($num_elements_per_dim, $geo, $ip)" begin
            # Get solution
            dim = Ferrite.getdim(ip)
            grid = generate_grid(geo, ntuple(x->num_elements_per_dim, dim));

            dh = DofHandler(grid)
            add!(dh, :u, dim, ip)
            close!(dh);

            f_ana(x) = Vec{dim}(i->(sum(x.^(i-1) /i)))
            u = Vector{Float64}(undef, ndofs(dh))
            Ferrite.apply_analytical!(u, dh, :u, f_ana)

            @testset "solution fields" begin
                plotter = FerriteViz.MakiePlotter(dh,u)
                data = FerriteViz.transfer_solution(plotter,u,process=x->x)
                visible_nodes = .!isnan.(data)# TODO add API
                for i ∈ 1:size(data, 1)
                    !visible_nodes[i] && continue
                    @test all(isapprox.(Vec{dim}(data[i,:]), f_ana(Vec{dim}(plotter.physical_coords[i])); atol=_test_tolerance(ip)))
                end
            end

            # Compute gradient/flux field
            @testset "gradient fields" begin
                (dh_grad, u_grad) = FerriteViz.interpolate_gradient_field(dh, u, :u)

                # Check gradient of solution
                qr = QuadratureRule{dim,Ferrite.getrefshape(ip)}(2) # TODO sample random point
                ip_geo = Ferrite.default_interpolation(geo)
                ip_grad = Ferrite.getfieldinterpolation(dh_grad, Ferrite.find_field(dh_grad, :gradient))
                cellvalues_grad = Ferrite.CellScalarValues(qr, ip_grad, ip_geo)
                for cell in CellIterator(dh_grad)
                    reinit!(cellvalues_grad, cell)
                    coords = getcoordinates(cell)
                    uₑ = @views u_grad[celldofs(cell)]
                    for q_point in 1:getnquadpoints(cellvalues_grad)
                        x = spatial_coordinate(cellvalues_grad, q_point, coords)
                        uₐₚₚᵣₒₓ = function_value(MatrixValued(), cellvalues_grad, q_point, uₑ)
                        uₐₙₐ = Tensors.gradient(f_ana, x)
                        @test all(isapprox.(uₐₙₐ, uₐₚₚᵣₒₓ;atol=_test_tolerance(ip)))
                    end
                end

                # Check for correct transfer
                plotter_grad = FerriteViz.MakiePlotter(dh_grad,u_grad)
                data_grad = FerriteViz.transfer_solution(plotter_grad,u_grad; field_name=:gradient, process=x->x)
                visible_nodes_grad = .!isnan.(data_grad)
                for i ∈ 1:size(data_grad, 1)
                    !visible_nodes_grad[i] && continue
                    # TODO WHYYYYYYYYYYYYYYYYYYYYYYYYYYY
                    @test all(isapprox.(transpose(Tensor{2,dim}(data_grad[i,:])), Tensors.gradient(f_ana, Vec{dim}(plotter_grad.physical_coords[i])); atol=_test_tolerance(ip)))
                end
            end
        end
    end
end
