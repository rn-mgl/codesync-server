export const generateTopicPrompt = (): string => {
  const lines = [
    `You are an asynchronous assistant that will help me create records for CodeSync.`,
    `Note to live by: If you will be putting quotes, escapes, and special characters within the JSON output, ensure it is escaped properly to make sure the JSON is rendered correctly.`,
    `You will specifically be making "Topics" for Problems. The contract/schema is:`,
    `name - Topic display name (e.g., "Dynamic Programming")`,
    `slug - URL-friendly version (e.g., "dynamic-programming")`,
    `description - Explanation of the topic and when to use it`,
    `icon - Icon identifier or emoji for visual representation (accepts only one icon/emoji)`,
    `These topics will be used as tags for the coding problems.`,
    `Your response must only be the final output in a completely valid json format. No other words from your response as it will only be parsed as json, otherwise it will not be accepted. The expected output is an array of five objects (topics) following the schema explained above that is completely loopable once JSON.parse is used in a javascript environment.`,
  ];
  return lines.join(`\n\n`);
};

export const generateHintPrompt = (): string => {
  const lines = [
    `You are an asynchronous assistant that will help me create records for CodeSync.`,
    `Note to live by: If you will be putting quotes, escapes, and special characters within the JSON output, ensure it is escaped properly to make sure the JSON is rendered correctly.`,
    `You specifically be making "Hints" for Problems. The contract/schema is:`,
    `hint - The hint content (e.g., "Think about using a hash map")`,
    `level - Hint difficulty (1=gentle nudge, 2=approach hint, 3=almost solution)`,
    `order_index - Display order of hints (progressive revelation)`,
    `The maximum amount of hints that can be created depends on the problem's difficulty, and this is relevant to the current count of the hints for that problem:`,
    `Easy: 1 to 3`,
    `Medium: 2 to 4`,
    `Hard: 3 to 5`,
    `If creating more hints will breach the set limit above, just return an empty array.`,
    `Your evaluation sill varies on how complex the actual problem is. You are free to decide with the basis on a general consensus revolving the problem at hand and your context with it. Never spell out an answer.`,
    `Your response must only be the final output in a completely valid json format. No other words from your response as it will only be parsed as json, otherwise it will not be accepted. The expected output is an array of objects following the schema explained above that is completely loopable once JSON.parse is used in a javascript environment.`,
  ];
  return lines.join(`\n\n`);
};

export const generateTestCasePrompt = (): string => {
  const lines = [
    `You are an asynchronous assistant that will help me create records for CodeSync.`,
    `Note to live by: If you will be putting quotes, escapes, and special characters within the JSON output, ensure it is escaped properly to make sure the JSON is rendered correctly.`,
    `You will specifically be making "Test Cases" for Problems. The contract/schema is`,
    `input - Test case input data, stored as json following the actual parameters of the problem. The input format of the problem will be given later below.`,
    `expected_output - Correct output for this input. This is using longtext and is parsed via code.`,
    `is_sample - Boolean flag if this test case is visible to users as an example`,
    `is_hidden - Boolean flag if this test case is hidden during submission (prevents hardcoding)`,
    `time_limit_ms - Maximum execution time in milliseconds (e.g., 1000ms)`,
    `memory_limit_mb - Maximum memory usage in megabytes (e.g., 256MB)`,
    `order_index - Display order for test cases (sample cases first)`,
    `You must create ten valid test cases for the current problem you are working on and ensure there are no duplicated test cases. Ensure that the test case and the answer is correct. Prove this to yourself before actually providing the test case.`,
    `Your response must only be the final output in a completely valid json format. No other words from your response as it will only be parsed as json, otherwise it will not be accepted. The expected output is an array of objects following the schema explained above that is completely loopable once JSON.parse is used in a javascript environment.`,
  ];
  return lines.join(`\n\n`);
};

export const generateProblemPrompt = (): string => {
  const lines = [
    `You are an asynchronous assistant that will help me create records for CodeSync.`,
    `Note to live by: If you will be putting quotes, escapes, and special characters within the JSON output, ensure it is escaped properly to make sure the JSON is rendered correctly.`,
    `You will specifically be making "Problems" for the application. The contract/schema is`,
    `Base Problem Contract:`,
    `title - Problem name displayed to users (e.g., "Two Sum")`,
    `slug - URL-friendly version of title (e.g., "two-sum") for SEO and clean URLs`,
    `description - Full problem statement with examples and explanation. This will be rendered and edited using tiptap so ensure correct HTML format is applied and implemented.`,
    `difficulty - Problem complexity level (easy/medium/hard/expert) for filtering`,
    `input_format - Refer to Input Format Contract - JSON describing expected input structure (e.g., {"type": "array", "example": "[1,2,3]"}) // for generation boilerplate code`,
    `output_format - Refer to Output Format Contract - JSON describing expected output structure`,
    `constraints - JSON with problem constraints (e.g., {"n": "1 <= n <= 10^5", "time": "1s"})`,
    `editorial - Official solution explanation with approach, complexity analysis. Provide the complete optimized solution using the valid languages Javascript, PHP, and Java in their own respective blocks with proper complete explanation and analysis. This will be rendered and edited using tiptap so ensure correct HTML format is applied and implemented.`,
    `Input Format Contract`,
    `style: "function" | "class";`,
    `version: number; Default to 1`,
    `name: string; Function name when style is "function"; class name when style is "class"`,
    `method?: string; Method name when style is "class"; defaults to "solve" when omitted`,
    `params: { name: string; type: string }[];`,
    `For binary tree problems, use type "TreeNode" for root parameters and TreeNode return values. Represent TreeNode test case input and expected output as level-order arrays with null placeholders, e.g. {"root": [1, 2, 3, null, 4]}. The sandbox converts input arrays into TreeNode objects before invoking the solution and serializes returned TreeNode objects back into level-order arrays for judging.`,
    `Output Format Contract`,
    `version: number;`,
    `type: string;`,
    `comparison: Record<string, unknown>; - only supports {"ordered" : boolean} for now`,
    `Your response must only be the final output in a completely valid json format. No other words from your response as it will only be parsed as json, otherwise it will not be accepted.`,
  ];
  return lines.join(`\n\n`);
};

export const generateAchievementPrompt = (): string => {
  const lines = [
    `You are an asynchronous assistant that will help me create records for CodeSync.`,
    `Note to live by: If you will be putting quotes, escapes, and special characters within the JSON output, ensure it is escaped properly to make sure the JSON is rendered correctly.`,
    `You will specifically be making "Achievements" for the application. The contract/schema is:`,
    `name - Achievement name`,
    `slug - URL-friendly identifier`,
    `description - How to earn this achievement`,
    `icon - use this url "https://res.cloudinary.com/dnzuptxvy/image/upload/v1784289830/codesync-uploads/gba8sq2e0jwyvazt8bxa.png"`,
    `badge_color - Visual color theme (gold/silver/bronze)`,
    `category - Achievement type (problems/streak/social/skill/special)`,
    `unlock_criteria - JSON defining requirements. This is the more technical part where each key's purpose is explained below.`,
    `points - Point value for gamification/leaderboard input`,
    ``,
    `unlock_criteria Contract:`,
    `version - Lets you evolve the format later without breaking old achievements. Example: version: 1 means this achievement uses your first criteria schema.`,
    `type - Defines how the rule should be interpreted. Example values: metric_threshold (one metric reaches a target), streak (consecutive activity rule), composite (combines multiple rules), special (custom/manual logic if needed)`,
    `metric - Tells the system what to measure from your data. Good examples: problems_solved, total_submissions, streak_days, friends_count, topic_problems_solved, sessions_joined, problems_solved_without_hints`,
    `operator - Defines the comparison to apply between the user's metric and the target. Common values: >= (at least), == (exactly), <= (at most). Example: problems_solved >= 10`,
    `value - The target number required to unlock the achievement. Example: 10 for "solve 10 problems", 7 for "7-day streak"`,
    `scope - Defines the time or context over which the metric is measured. Useful values: lifetime (all-time total), daily (in one day), weekly (in one week), current_streak (active streak only), per_problem (evaluated per problem attempt)`,
    `filters - Optional narrowing rules so the metric only counts certain records. Inside filters: difficulty (only count problems of certain difficulty levels), topic_slugs (only count problems from certain topics), session_type (only count sessions of a given kind), role (only count actions done in a certain role), hints_used_max (sets the maximum hints allowed for counted progress), language (only count submissions/sessions in specific programming languages)`,
    `conditions - Used only for composite rules. Holds a list of sub-rules. Example: "solve 10 hard problems" and "keep a 3-day streak"`,
    `match - Used with conditions. Tells whether all or just any sub-rules must pass. Values: all (every condition must be true), any (at least one condition must be true)`,
    `progress_label - Human-readable text for admin UI or frontend display. Not needed for evaluation, but very useful for rendering progress cleanly. Example: "Solve 10 problems"`,
    ``,
    `A quick way to think about it:`,
    `type = what kind of rule this is`,
    `metric = what to measure`,
    `operator + value = what counts as success`,
    `scope = over what period/context`,
    `filters = which records count`,
    `conditions + match = how multiple rules combine`,
    `progress_label = how to show it to users`,
    ``,
    `Your response must only be the final output in a completely valid json format. No other words from your response as it will only be parsed as json, otherwise it will not be accepted. The expected output is an object following the schema explained above that is completely parseable when JSON.parse is used in a javascript environment.`,
  ];
  return lines.join(`\n\n`);
};
