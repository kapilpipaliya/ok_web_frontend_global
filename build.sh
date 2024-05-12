# Exit immediately if a command exits with a non-zero status.
set -e

# Save the project directory to a variable
project_dir="$HOME/ok_web_frontend_global"

# Clone or pull the vcpkg repository
if [ -d "$project_dir" ]; then
    # If the ok_web_frontend_global directory exists, pull the latest changes
    echo "Updating existing ok_web_frontend_global..."
    cd $project_dir

    # Check if there are changes in the working directory
    if git diff --quiet && git diff --cached --quiet; then
        echo "No changes in the working directory."
    else
        # Stash changes if there are any
        git stash push -m "Stashing local changes before pulling"
        stash_applied=1
    fi

    # Pull changes from the remote repository
    git pull

    # Pop the stash only if it was applied earlier
    if [ "$stash_applied" = 1 ]; then
        unset stash_applied
        git stash pop
    fi
    if [ $? -ne 0 ]; then
        echo "git pull failed, handling failure..."
        echo "An error occurred, exiting the script."
        exit 1
    fi
else
    # If the ok_web_frontend_global directory doesn't exist, clone the repository
    echo "Cloning new project ok_web_frontend_global..."
    git clone https://github.com/kapilpipaliya/ok_web_frontend_global.git $project_dir
    cd $project_dir
fi

npm install

npm run build