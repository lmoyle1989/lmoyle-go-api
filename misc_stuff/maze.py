import random

# Generates a randomized grid maze of size m x n with intended start position to be 0,0 and ending at m-1,n-1
# TODOs:
#   - generate a correct route first followed by a number of dead end branches
#   - make it favor straigher paths by adding the last dir duplicated onto the shuffled dir list
#   - add command line args with import sys
class Maze:
  def __init__(self, m, n):
    self.m = m
    self.n = n
    self.path = set() # this does not need to be a set
    self.vis = []
    self.initVis()
    self.generatePath()
    self.addPathToVis()

  def initVis(self):
    for i in range((self.m * 2) - 1):
      row = []
      for j in range((self.n * 2) - 1):
        if j % 2 == 0 and i % 2 == 0:
          row.append("X")
        else:
          row.append(" ")
      self.vis.append(row)
    
  def generatePath(self):
    start = ((0,0), (0,0)) # (current cell, coming from this cell) aka "edge"
    dir = [(1,0), (0,1), (-1,0), (0,-1)]
    visited = set()

    def isValid(row, col):
      return row >= 0 and row < self.m and col >= 0 and col < self.n and (row,col) not in visited

    stack = [start] # sort and then shuffle the first, say, 80% so I don't get branches near the end
    while stack:
      edge = stack.pop()
      cur = edge[0]
      row, col = cur
      if cur not in visited:
        visited.add(cur)
        self.path.add(edge)
        if cur != (self.m - 1, self.n - 1):
          random.shuffle(dir)
          for x, y in dir:
            newr = row + x
            newc = col + y
            if isValid(newr, newc):
              stack.append(((newr, newc), (row, col)))

  def addPathToVis(self):
    
    def removeWall(edge):
      row1, col1 = edge[0]
      row2, col2 = edge[1]
      cur = (row1 * 2, col1 * 2)
      d = (row2 - row1, col2 - col1)
      self.vis[cur[0] + d[0]][cur[1] + d[1]] = "X"

    for edge in self.path:
      removeWall(edge)

  def printMaze(self):
    for row in self.vis:
      line = []
      for c in row:
        if c == "X":
          line.append("XX")
        else:
          line.append("  ")
      print("".join(line))


if __name__ == "__main__":
  maze = Maze(25, 25)
  maze.printMaze()
