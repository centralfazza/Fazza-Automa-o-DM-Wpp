import zipfile
import os

source_dir = r"c:/Users/vinic/OneDrive/Desktop/Projetos saas/Fazza-Automa-o-DM-Wpp-main/backend"
output_zip = r"c:/Users/vinic/OneDrive/Desktop/Projetos saas/Fazza-Automa-o-DM-Wpp-main/railway_deploy.zip"

with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(source_dir):
        if '__pycache__' in dirs:
            dirs.remove('__pycache__')
        
        for file in files:
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, source_dir)
            
            if arcname == "main.py":
                arcname = "app.py"
            
            print(f"Adding {arcname}...")
            zipf.write(file_path, arcname)

print(f"Successfully created {output_zip}")
