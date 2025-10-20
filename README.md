# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Pushing to GitHub

Here are the steps to push your project code to a new GitHub repository:

1.  **Initialize a Git repository** in your project folder. Open a terminal, navigate to your project's root directory, and run:
    ```bash
    git init
    ```

2.  **Add all files to staging**. This prepares all your project files for the first commit.
    ```bash
    git add .
    ```

3.  **Make your first commit**. This saves a snapshot of your project's current state.
    ```bash
    git commit -m "Initial commit"
    ```

4.  **Create a new repository on GitHub**.
    - Go to [github.com/new](https://github.com/new).
    - Give your repository a name (e.g., `examprep-app`).
    - Choose whether you want it to be public or private.
    - **Do not** initialize it with a README, .gitignore, or license file, as your project already has these.
    - Click "Create repository".

5.  **Link your local repository to GitHub**. On the next page, GitHub will show you a URL for your new repository. Copy it and run the following command, replacing the URL with your own:
    ```bash
    git remote add origin https://github.com/your-username/your-repository-name.git
    ```

6.  **Push your code to GitHub**. This uploads your commit to the `main` branch on GitHub.
    ```bash
    git push -u origin main
    ```

That's it! Your code will now be safely stored on GitHub.