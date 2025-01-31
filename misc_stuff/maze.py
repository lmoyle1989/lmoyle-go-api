import random
import json
import sys

# Generates a randomized grid maze of size m x n with intended start position to be 0,0 and ending at m-1,n-1
# TODOs:
#   - generate a correct route first followed by a number of dead end branches
#   - make it favor straigher paths by adding the last dir duplicated onto the shuffled dir list
#   - add command line args with import sys
class Maze:
  def __init__(self, m, n):
    self.m = m
    self.n = n
    self.pathEdges = [] # this does not need to be a set
    self.vis = []
    self.straightness = 1 # scale as a proportion to the center
    self.initVis()
    self.generatePathEdges()
    self.addEdgesToVis()

  def initVis(self):
    for i in range((self.m * 2) - 1):
      row = []
      for j in range((self.n * 2) - 1):
        if j % 2 == 0 and i % 2 == 0:
          row.append("X")
        else:
          row.append(" ")
      self.vis.append(row)
    
  def generatePathEdges(self):
    start = (0,0) # (current cell, coming from this cell) aka "edge"
    end = (self.m - 1, self.n - 1)
    dir = [(1,0), (0,1), (-1,0), (0,-1)]
    visited = set()

    def isValid(row, col):
      return row >= 0 and row < self.m and col >= 0 and col < self.n and (row,col) not in visited

    stack = [[start, start]] # sort and then shuffle the first, say, 80% so I don't get branches near the end
    while stack:
      edge = stack.pop()
      cur = edge[0]
      row, col = cur
      last = edge[1]
      lrow, lcol = last
      if cur not in visited:
        visited.add(cur)
        self.pathEdges.append(edge)
        if cur != end:
          dir = [(1,0), (0,1), (-1,0), (0,-1)]
          if row != self.m - 1 and col != self.n - 1 and row != 0 and col != 0:
            for _ in range(self.straightness):
              dir.append((row - lrow, col - lcol))
          random.shuffle(dir)
          for x, y in dir:
            newr = row + x
            newc = col + y
            if isValid(newr, newc):
              stack.append([(newr, newc), (row, col)])
        else:
          random.shuffle(stack)

  def addEdgesToVis(self):
    
    def addEdge(edge):
      row1, col1 = edge[0]
      row2, col2 = edge[1]
      cur = (row1 * 2, col1 * 2)
      d = (row2 - row1, col2 - col1)
      self.vis[cur[0] + d[0]][cur[1] + d[1]] = "X"

    for edge in self.pathEdges:
      addEdge(edge)

  def printMaze(self):
    for row in self.vis:
      line = []
      for c in row:
          line.append(f"{c}{c}")
      print("".join(line))

  def getJson(self):
    data = {
      "m": self.m,
      "n": self.n,
      "edges": self.pathEdges,
      "vis": self.vis
    }
    return json.dumps(data)


if __name__ == "__main__":
  maze = Maze(5, 5)
  if len(sys.argv) > 1 and sys.argv[1] == "json":
    print(maze.getJson())
  else:
    maze.printMaze()
