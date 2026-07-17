# Branch GLB

Drop a GLB/GLTF branch model here as `branch.glb` (path: `/models/branch.glb`).

When the file exists, `BranchScene` loads it automatically and applies the
fibrous glow shader to every mesh in the model, replacing the procedural
fiber bundle. Otherwise, the procedural branch continues to render.

You can override the URL by passing `glbUrl` to `<BranchScene />`.
