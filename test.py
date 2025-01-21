import matplotlib.pyplot as plt

# Data for the plot (DFS to find SCCs with recursion calls for three SCCs)
recursion_depth = [3, 2, 1, 3, 2, 3, 2, 1, 0]
start_times = [1, 2, 3, 7, 8, 11, 12, 13, 14]
end_times = [6, 5, 4, 10, 9, 18, 17, 16, 15]
labels = ['I', 'G', 'H', 'E', 'F', 'B', 'D', 'A', 'C']

# Sort data to ensure higher recursion depths are at the top
sorted_data = sorted(zip(recursion_depth, start_times, end_times, labels), reverse=True, key=lambda x: x[0])
recursion_depth, start_times, end_times, labels = zip(*sorted_data)

# Create the plot
fig, ax = plt.subplots(figsize=(12, 8))

for depth, start, end, label in zip(recursion_depth, start_times, end_times, labels):
    ax.broken_barh([(start, end - start)], (depth * 0.2, 0.4), facecolors='navy', edgecolor='black')
    ax.text((start + end) / 2, depth * 0.5, label, color='white', weight='bold',
            ha='center', va='center', fontsize=10)

# Set labels and grid
ax.set_xlabel('Time', fontsize=12)
ax.set_ylabel('Recursion Depth', fontsize=12)
ax.set_yticks([i for i in range(min(recursion_depth) * 2, max(recursion_depth) * 2 + 1)])
ax.set_xticks(range(1, 19))
ax.grid(axis='y', linestyle='--', linewidth=0.7, alpha=0.7)

# Show the plot
plt.title('Recursion Call Path for SCCs', fontsize=14)
plt.tight_layout()
plt.show()
