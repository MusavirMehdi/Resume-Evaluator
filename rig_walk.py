import bpy
import math
from mathutils import Vector


scene = bpy.context.scene
mesh = next((obj for obj in bpy.data.objects if obj.type == 'MESH'), None)
if mesh is None:
    raise RuntimeError('No mesh found in the current scene')
if any(obj.type == 'ARMATURE' for obj in bpy.data.objects):
    raise RuntimeError('An armature already exists; refusing to create a duplicate')

corners = [mesh.matrix_world @ Vector(corner) for corner in mesh.bound_box]
mins = [min(corner[i] for corner in corners) for i in range(3)]
maxs = [max(corner[i] for corner in corners) for i in range(3)]
center = [(mins[i] + maxs[i]) * 0.5 for i in range(3)]
height = maxs[2] - mins[2]
width = maxs[0] - mins[0]
depth = maxs[1] - mins[1]
if height < max(width, depth):
    raise RuntimeError('The mesh does not appear upright on the Z axis; no changes made')

cx, cy, bottom = center[0], center[1], mins[2]
hip_x = max(width * 0.23, 0.035)
shoulder_x = max(width * 0.32, 0.045)
elbow_x = max(width * 0.48, 0.065)
wrist_x = max(width * 0.52, 0.070)
toe_y = cy - depth * 0.42

arm_data = bpy.data.armatures.new('Walk Rig')
rig = bpy.data.objects.new('Walk Rig', arm_data)
bpy.context.collection.objects.link(rig)
rig.show_in_front = True
arm_data.display_type = 'OCTAHEDRAL'

def point(x, z, y=cy):
    return (cx + x, y, bottom + z * height)

bpy.context.view_layer.objects.active = rig
rig.select_set(True)
bpy.ops.object.mode_set(mode='EDIT')
eb = arm_data.edit_bones

def bone(name, head, tail, parent=None, deform=True):
    b = eb.new(name)
    b.head = head
    b.tail = tail
    b.use_deform = deform
    b.roll = 0.0
    if parent:
        b.parent = eb[parent]
    return b

bone('root', point(0, 0.39), point(0, 0.49), deform=False)
bone('spine', point(0, 0.47), point(0, 0.73), 'root')
bone('neck', point(0, 0.73), point(0, 0.83), 'spine')
bone('head', point(0, 0.81), point(0, 0.98), 'neck')

for side, sign in (('L', -1), ('R', 1)):
    xh = sign * hip_x
    xs = sign * shoulder_x
    xe = sign * elbow_x
    xw = sign * wrist_x
    bone(f'thigh.{side}', point(xh, 0.49), point(xh * 1.12, 0.25), 'root')
    bone(f'shin.{side}', point(xh * 1.12, 0.25), point(xh * 1.12, 0.08), f'thigh.{side}')
    bone(f'foot.{side}', point(xh * 1.12, 0.08), (cx + xh * 1.12, toe_y, bottom + 0.035 * height), f'shin.{side}')
    bone(f'upper_arm.{side}', point(xs, 0.72), point(xe, 0.55), 'spine')
    bone(f'forearm.{side}', point(xe, 0.55), point(xw, 0.39), f'upper_arm.{side}')
    bone(f'hand.{side}', point(xw, 0.39), point(xw, 0.33), f'forearm.{side}')

bpy.ops.object.mode_set(mode='OBJECT')

# Bind the full character mesh using Blender's bone-heat automatic weights.
bpy.ops.object.select_all(action='DESELECT')
mesh.select_set(True)
rig.select_set(True)
bpy.context.view_layer.objects.active = rig
bpy.ops.object.parent_set(type='ARMATURE_AUTO')

rig.animation_data_create()
scene.frame_start = 1
scene.frame_end = 25
scene.render.fps = 24
action = bpy.data.actions.new('Walk Cycle | In Place')
rig.animation_data.action = action

pose = rig.pose.bones
for pb in pose:
    pb.rotation_mode = 'XYZ'

frames = (1, 7, 13, 19, 25)
for idx, frame in enumerate(frames):
    phase = idx * (math.pi / 2.0)
    leg_l = math.sin(phase) * 0.42
    leg_r = math.sin(phase + math.pi) * 0.42
    for name, angle in (('thigh.L', leg_l), ('thigh.R', leg_r)):
        pose[name].rotation_euler[0] = angle
        pose[name].keyframe_insert('rotation_euler', frame=frame, group=name)
    pose['shin.L'].rotation_euler[0] = max(0.0, -leg_l) * 0.85
    pose['shin.R'].rotation_euler[0] = max(0.0, -leg_r) * 0.85
    pose['shin.L'].keyframe_insert('rotation_euler', frame=frame, group='Legs')
    pose['shin.R'].keyframe_insert('rotation_euler', frame=frame, group='Legs')
    pose['foot.L'].rotation_euler[0] = -pose['shin.L'].rotation_euler[0] * 0.45
    pose['foot.R'].rotation_euler[0] = -pose['shin.R'].rotation_euler[0] * 0.45
    pose['foot.L'].keyframe_insert('rotation_euler', frame=frame, group='Legs')
    pose['foot.R'].keyframe_insert('rotation_euler', frame=frame, group='Legs')
    pose['upper_arm.L'].rotation_euler[0] = -leg_r * 0.65
    pose['upper_arm.R'].rotation_euler[0] = -leg_l * 0.65
    pose['upper_arm.L'].keyframe_insert('rotation_euler', frame=frame, group='Arms')
    pose['upper_arm.R'].keyframe_insert('rotation_euler', frame=frame, group='Arms')
    pose['forearm.L'].rotation_euler[0] = -0.08
    pose['forearm.R'].rotation_euler[0] = -0.08
    pose['forearm.L'].keyframe_insert('rotation_euler', frame=frame, group='Arms')
    pose['forearm.R'].keyframe_insert('rotation_euler', frame=frame, group='Arms')
    pose['root'].location.z = 0.008 * math.cos(phase * 2.0)
    pose['root'].keyframe_insert('location', frame=frame, group='Root')
    pose['spine'].rotation_euler[1] = 0.025 * math.sin(phase)
    pose['spine'].keyframe_insert('rotation_euler', frame=frame, group='Torso')

if action:
    for fc in getattr(action, 'fcurves', []):
        for key in fc.keyframe_points:
            key.interpolation = 'BEZIER'

scene.frame_set(1)
bpy.ops.object.select_all(action='DESELECT')
rig.select_set(True)
bpy.context.view_layer.objects.active = rig
print('RIG_WALK_DONE', rig.name, mesh.name, len(arm_data.bones), action.name)
