package main

import (
	"fmt"
	"os"
	"log"
	"database/sql"
	"net/http"

	_ "github.com/mattn/go-sqlite3" 
)

type Page struct {
	Title string
	Body []byte
}

func (p *Page) save() error {
	filename := p.Title + ".txt"
	return os.WriteFile(filename, p.Body, 0600)
}

func loadPage(title string) (*Page, error) {
	filename := title + ".txt"
	body, err := os.ReadFile(filename)
	if err != nil {
		return nil, err
	}
	return &Page{Title: title, Body: body}, nil
}

func root_handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Slug: %s", r.URL.Path[1:])
}

func main() {
	os.Remove("TestPage.txt")
	os.Remove("sqlite-database.db")

	file, err := os.Create("sqlite-database.db")
	if err != nil {
		log.Fatal(err.Error())
	}
	file.Close()
	
	mydb, _ := sql.Open("sqlite3", "./sqlite-database.db")
	defer mydb.Close()

	p1 := &Page{Title: "TestPage", Body: []byte("This is sample page content.")}
	p1.save()
	p2, _ := loadPage("TestPage")
	fmt.Println(string(p2.Body))

	http.HandleFunc("/", root_handler)
	log.Fatal(http.ListenAndServe(":8080", nil))
}
