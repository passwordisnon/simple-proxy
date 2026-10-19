"""Imports every .fbx under a folder into the open Unreal project as static meshes.

Runs inside Unreal's Python (Python Editor Script Plugin), usually without the editor window:

    UnrealEditor-Cmd Spore2.uproject -run=pythonscript -script="import_spore_fbx.py" \
        -unattended -nosplash -nop4

Settings come from environment variables (the pipeline script sets them):
    SPORE_FBX_DIR    folder with the .fbx files (required)
    SPORE_UE_DEST    content folder to import into (default /Game/Spore)
    SPORE_UE_FORCE   "1" re-imports files that already have an asset

The folder layout below SPORE_FBX_DIR is kept (made safe for Unreal paths). Materials and the
textures embedded by spore_to_unreal.py are imported with each mesh; collision and lightmap
UVs are generated. Existing assets are skipped unless SPORE_UE_FORCE is set, so a re-run only
imports what is new. Imports run in batches and every batch is saved, so a crash halfway keeps
what was already done. A summary goes to the log and to <SPORE_FBX_DIR>/unreal-import.json.
"""

import json
import os
import re

import unreal

BATCH = 100


def safe(name):
    return re.sub(r"[^A-Za-z0-9_]", "_", name)


def make_task(fbx_path, destination):
    task = unreal.AssetImportTask()
    task.filename = fbx_path
    task.destination_path = destination
    task.automated = True
    task.replace_existing = True
    task.save = True

    options = unreal.FbxImportUI()
    options.import_mesh = True
    options.import_as_skeletal = False
    options.import_materials = True
    options.import_textures = True
    options.import_animations = False
    options.mesh_type_to_import = unreal.FBXImportType.FBXIT_STATIC_MESH
    data = options.static_mesh_import_data
    data.combine_meshes = True
    data.auto_generate_collision = True
    data.generate_lightmap_u_vs = True
    task.options = options
    return task


def main():
    source = os.environ.get("SPORE_FBX_DIR", "")
    destination_root = os.environ.get("SPORE_UE_DEST", "/Game/Spore").rstrip("/")
    force = os.environ.get("SPORE_UE_FORCE") == "1"
    if not os.path.isdir(source):
        unreal.log_error(f"Spore import: SPORE_FBX_DIR is not a folder: {source!r}")
        return

    tasks, skipped = [], 0
    for dirpath, _, files in os.walk(source):
        rel = os.path.relpath(dirpath, source)
        folder = destination_root if rel == "." else destination_root + "/" + "/".join(safe(p) for p in rel.split(os.sep))
        for name in sorted(files):
            if not name.lower().endswith(".fbx"):
                continue
            asset = folder + "/" + safe(os.path.splitext(name)[0])
            if not force and unreal.EditorAssetLibrary.does_asset_exist(asset):
                skipped += 1
                continue
            tasks.append(make_task(os.path.join(dirpath, name), folder))

    unreal.log(f"Spore import: {len(tasks)} to import, {skipped} already in the project")
    tools = unreal.AssetToolsHelpers.get_asset_tools()
    imported, failed = 0, []
    for start in range(0, len(tasks), BATCH):
        batch = tasks[start:start + BATCH]
        tools.import_asset_tasks(batch)
        for task in batch:
            if task.imported_object_paths:
                imported += 1
            else:
                failed.append(task.filename)
        unreal.EditorAssetLibrary.save_directory(destination_root, only_if_is_dirty=True, recursive=True)
        unreal.log(f"Spore import: {min(start + BATCH, len(tasks))}/{len(tasks)}")

    summary = {"imported": imported, "already_present": skipped, "failed": failed, "destination": destination_root}
    with open(os.path.join(source, "unreal-import.json"), "w") as out:
        json.dump(summary, out, indent=1)
    unreal.log(f"Spore import: imported {imported}, already present {skipped}, failed {len(failed)}")


main()
