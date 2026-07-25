const checkMentorCapacityTool = {
  type: "function",
  name: "check_mentor_capacity",
  description: "Checks mentor availability for a requested learning track.",
  parameters: {
    type: "object",
    properties: {
      track: {
        type: "string",
        enum: ["Frontend", "Backend", "Project Management"],
        description: "The learning track the user wants to pursue."
      }
    },
    required: ["track"]
  }
};

module.exports = { checkMentorCapacityTool };
