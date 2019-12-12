


# Baking out a high poly model -> low poly model
https://youtu.be/Oyu8pkkjFXI
https://youtu.be/wX7isIJOkzE
https://youtu.be/ENVfvfSxNEA
1) Make the sure the high poly model textures are cleaned.  Remove any unused.
2) Duplicate the high poly model so that the copy is exaclty overlayed on top of the original.
   SHIFT + D and immediately right click.
3) Convert the duplicate into a low poly model.
   - go to edit mode and select the outer mesh (using L).  Select invert -> x and delete
     the inner mesh vertices.
   - then on the entire mesh do: decimate modifier -> Planar (lower angle looks better).
   - The key here is the get it to a level where it doesn't deform the original
   geometry too much but going too low can create issues later on.
4) Remove all existing textures on the low poly copy.
5) Add a new texture on the low poly copy.
6) Select the low poly copy and go to the shader editor and do SHT + A and
   add a new image texture.  This texture will be the high poly contents.
7) UV Unwrap the low poly copy.  Select the object -> tab (edit mode) ->
   UV -> Unwrap.  A normal unwrap seems to work best.
8) Now to bake the composite, first hide the low poly mode.  Then select
   the high poly model and then CTRL + Left click to select the low poly.
   Make sure to selec the high poly then low poly.
9) Selec the image texture in the shader editor (the one you created in step 6)
10) Over in cycles, in adjust your sampling (set it to something low to initial test)
11) Bake -> Make sure "Selected to Active" is enabled and set the ray distance to 0.2m or whatever
    is appropriate.
12) Once bake is done, add an emission node and connect the image texture to
    output the baked image on your low poly model and you are done.



# Exporting to gltf

- By default, everything gets baked in, even your hidden high polymodels.
  The easiest way to get around this is to put all your "final" active
  objects in one collection.  Prior to exporting, right click on the selection,
  hit select and then when exporting to gltf, use the "selected objects" options.
  Now it will only export your selected objects.
- Always use JPG compression.  PNG sometimes just doesn't work.
- If you have image texture -> emission (or principle bsdf) -> material output
  but have an island orphan principle bsdf shader, the export won't work
  because the island orphan gets in the way.  However, the island orphan
  is often nice to keep around because that is what you used for baking.
  To get around this, create a second material output and tie your
  image baked image texutre -> principle bsdf -> material output and select
  "eevee" (don't use emission since it doens't seem to work).
  For your island principle bsdf, tie it to a separate material
  ouput to cycles. See material-ouput.jpg in this folder for an
  example of this setup.
- Ensure Y up is enbaled since threef relies on the correct orientation.

- When exporting a multiple scenes in one, gltf combines cameras and animations
  into arrays.  When importing, we don't have a way to know, which animation
  is associated with which scene.
  This problem is solved by naming convention.  PREFIX all your cameras, animations
  by  something unique to the scene. "scene1-camera", "scene1-camera-animation"
  etc.  We can then use that as a basis to filter animations per scene.


# Text Markers
- By convention, text markers should be named with 'text-markerX'
- Don't use multimaterials on text markers because three.js created multiple Objects out of it
- Best practice is to use a plane geomery that is square.  You can have one material.
- Getting rotation right.
  This is a bit tricky at first.
  1) To do it right, first set your camera to rotation(90,0,0) (x 90)
  2) Next add plane.
  3) Rotate that plane by x90.  So the rotation should be 90,0,0.
  4) Now do apply scale and rotation (not transform).
     So your rotation should now be 0,0,0 and scale at 1,1,1.
  5) Now add your animations as needed.
  This best way to imagine this is that your rotations get calculated from a set space and orientation.
  In this case, we assume that all rotation calculations start from the camera rotation 90,0,0
  and text markers face the camera with that rotation being 0,0,0.


# Animating Alpha
- https://blender.stackexchange.com/questions/81851/does-transparency-work-in-eevee
- Render -> Screen Space Reflections ON
- Render -> Screen Space Reflections -> Refraction ON
- Material → Principled BSDF → Transmission 1.000
- Material → Settings → Blend Mode Alpha Blend
- Material → Settings → Screen Space Refraction ON
