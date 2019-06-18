## Monash Bootcamp Content Tool

# Setup

You need

- `node`
- `yarn`

## Step 1 - Clone content repositories

- In this folder, clone the `FullStack-Lesson-Plans` repository.
- In this folder, clone your class' content repository.

## Step 2 - Create config file

Create a `config.json` file in this directory. eg:

```json
{
  "curriculum-repo": "FullStack-Lesson-Plans",
  "class-repo": "MONMEL201905FSF3"
}
```

## Step 3 - Install dependencies

```
yarn
```

# Usage

## Purging solutions and rubrics

Use this function to find solution files in your class content repository and delete them to prevent accidentally publishing solutions early.

- `node index`
- follow the prompts to select solution and rubric files to delete
