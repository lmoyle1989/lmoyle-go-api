import random
import json
import sys
import os
import time

# Generates a randomized grid maze of size m x n with intended start position to be 0,0 and ending at m-1,n-1
# TODOs:
#   - generate a correct route first followed by a number of dead end branches
#   - make it favor straigher paths by adding the last dir duplicated onto the shuffled dir list
#   - add command line args with import sys
class Maze:
  def __init__(self, m, n, seed):
    random.seed(seed)
    self.m = m
    self.n = n
    self.pathEdges = []
    self.vis = []
    self.lines = []
    self.solutionPath = []
    self.straightness = 2 # could try scaling as a distance of the current path node to the center?
    self.initVis()
    self.generatePathEdges()
    self.addEdgesToVis()
    self.lines.append(self.generateHorizontalLines())
    self.lines.append(self.generateVerticalLines())

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
    dirs = [(1,0), (0,1), (-1,0), (0,-1)]
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
          dirs = [(1,0), (0,1), (-1,0), (0,-1)]
          if row != self.m - 1 and col != self.n - 1 and row != 0 and col != 0:
            for _ in range(self.straightness):
              dirs.append((row - lrow, col - lcol))
          random.shuffle(dirs)
          for x, y in dirs:
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

    for row in self.vis:
      row.insert(0, " ")
      row.append(" ")

    hborder = [" " for _ in range((self.n * 2) + 1)]
    self.vis.insert(0, hborder)
    self.vis.append(hborder)

  def printMaze(self):
    for row in self.vis:
      line = []
      for c in row:
          if c == "X":
            line.append("[]")
          else:
            line.append(f"{c}{c}")
      print("".join(line))

  def printNarrowMaze(self):
    for row in self.vis:
      print("".join(row))

  def getJson(self):
    data = {
      "m": self.m,
      "n": self.n,
      "lines": self.lines,
      "solution": self.solutionPath
    }
    return json.dumps(data)

  def generateHorizontalLines(self):
    hlines = []
    for i in range(0, len(self.vis), 2):
      rowlines = []
      start = -1
      for j in range(len(self.vis[i])):
        if self.vis[i][j] != "X":
          if start == -1:
            start = j
        else:
          if start != -1 and (j - start > 1):
            rowlines.append([start, j - 1])
          start = -1
      if start != -1 and (j - start > 1):
        rowlines.append([start, j])
      hlines.append(rowlines)

    return hlines

  def generateVerticalLines(self):
    vlines = []
    for j in range(0, len(self.vis[0]), 2):
      collines = []
      start = -1
      for i in range(len(self.vis)):
        if self.vis[i][j] != "X":
          if start == -1:
            start = i
        else:
          if start != -1 and (i - start > 1):
            collines.append([start, i - 1])
          start = -1
      if start != -1 and (i - start > 1):
        collines.append([start, i])
      vlines.append(collines)

    return vlines

  def solveMaze(self, start, animate):
    curPath = []
    solutionPath = [[start[0], start[1]]]
    solved = False
    end = ((self.m * 2) - 1, (self.n * 2) - 1)

    def animateFrame(s):
      os.system('clear')
      self.printMaze()
      time.sleep(s)

    def mazeDfs(cur):
      nonlocal solved
      dirs = [(1,0), (0,1), (-1,0), (0,-1)]
      if not solved:
        r,c = cur
        lr, lc = solutionPath[-1]
        if abs(lr - r) + abs (lc - c) > 1: # after we backtrack back to the main path, the code skips the fork node b/c we already visited it, we need to refind it to add it back to the solution path # there is definitely a bug here. if the T fork itself is built off of a another fork we can have jump larger than 1
          for x,y in dirs: # there is definitely a bug here. if the T fork itself is built off of a another fork we can have jump larger than 1
            if self.vis[r+x][c+y] == "O":
              solutionPath.append([r+x, c+y])
              break
        self.vis[r][c] = "O"
        curPath.append(cur)
        solutionPath.append([r,c])
        if animate:
          animateFrame(0.025)
        if (r,c) == end:
          solved = True
        else:
          random.shuffle(dirs)
          for x,y in dirs:
            newr = r + x
            newc = c + y
            if self.vis[newr][newc] == "X":
              mazeDfs((newr, newc))
          pr,pc = curPath.pop()
          if not solved:
            if [pr,pc] != solutionPath[-1]:
              solutionPath.append([pr,pc])
            self.vis[pr][pc] = "Z"
            if animate:
              animateFrame(0.025)
    
    mazeDfs(start)
    self.solutionPath = solutionPath[1:]
    self.solutionPath.append(solutionPath[-1]) # add a duplicate of the end point so the animation stops

if __name__ == "__main__":
  # sys.setrecursionlimit(2000)
  seed = random.randint(1, 10000)
  if len(sys.argv) > 1 and sys.argv[1] != "json":
    seed = sys.argv[1]
  maze = Maze(25, 25, seed) # much bigger than this an the recusion limit is reached  
  if len(sys.argv) > 1 and sys.argv[1] == "json":
    maze.solveMaze((1,1), False)
    print(maze.getJson())
  else:
    maze.solveMaze((1,1), True)
