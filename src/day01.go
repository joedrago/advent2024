package main

import (
	"fmt"
	"os"
	"slices"
	"strconv"
	"strings"
)

func main() {
	argv := os.Args[1:]
	if len(argv) < 1 {
		fmt.Printf("Syntax: day1 [input.txt]\n")
		return
	}

	rawInput, err := os.ReadFile(argv[0])
	if err != nil {
		panic(err)
	}
	lines := strings.Split(strings.ReplaceAll(string(rawInput), "\r\n", "\n"), "\n")

	listL := make([]int, 0, len(lines))
	listR := make([]int, 0, len(lines))
	countR := make(map[int]int)

	for i := 0; i < len(lines); i++ {
		if len(lines[i]) < 1 {
			continue
		}
		rawNums := strings.Fields(lines[i])
		if len(rawNums) < 2 {
			continue
		}

		l, err := strconv.Atoi(rawNums[0])
		if err != nil {
			panic(err)
		}
		listL = append(listL, l)

		r, err := strconv.Atoi(rawNums[1])
		if err != nil {
			panic(err)
		}
		listR = append(listR, r)
		countR[r]++
	}

	slices.Sort(listL)
	slices.Sort(listR)

	totalDistance := 0
	similarityScore := 0
	for i := 0; i < len(listL); i++ {
		l := listL[i]
		r := listR[i]

		diff := l - r
		if diff < 0 {
			diff = -diff
		}
		totalDistance += diff

		similarityScore += l * countR[l]
	}

	fmt.Printf("Total Distance  : %v\n", totalDistance)
	fmt.Printf("Similarity Score: %v\n", similarityScore)
}
