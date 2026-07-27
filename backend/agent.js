const checkMentorCapacityTool = {
  type: "function",
  name: "check_mentor_capacity",
  description: "Checks mentor availability for a requested learning track. If the track is full, the result may include an 'alternative' mentor in a different track with real open capacity.",
  parameters: {
    type: "object",
    properties: {
      track: {
        type: "string",
        enum: [
          "Frontend",
          "Backend",
          "Project Management",
          "Cloud Computing",
          "Data Analytics",
          "AI / Machine Learning",
          "Android / Mobile Development",
          "UI/UX Design",
          "Cybersecurity",
          "DevOps / SRE",
          "IT Support",
          "Digital Marketing"
        ],
        description: "The learning track the user wants to pursue."
      }
    },
    required: ["track"]
  }
};

module.exports = { checkMentorCapacityTool };
