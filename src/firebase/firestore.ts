import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "./firebase-config";
import { Note } from "@/types";

const notesRef = collection(db, "notes");

export const getNotes = async (
  uid: string,
  filters: {
    type: string;
    status: string;
    priority: string;
    dateRange?: { from?: Date; to?: Date };
    tags: string[];
    searchText: string;
  },
) => {
  const q = query(
    notesRef,
    where("userId", "==", uid),
    orderBy("date", "desc"),
  );

  const snapshot = await getDocs(q);
  const notes = snapshot.docs.map((doc) => ({
    id: doc.id,
    uid: doc.data().userId,
    title: doc.data().title,
    content: doc.data().content,
    type: doc.data().type,
    status:
      doc.data()?.status === "todo" ? "to-do" : doc.data()?.status || null,
    priority: doc.data()?.priority || null,
    term: doc.data().term
      ? doc.data().term.toDate()
      : doc.data().term
        ? new Date(doc.data().term)
        : null,
    date: doc.data().date?.toDate
      ? doc.data().date.toDate()
      : doc.data().date
        ? new Date(doc.data().date)
        : null,
    tags: doc.data()?.tags || [],
  }));

  const filteredNotes: Note[] = notes.filter((note) => {
    const matchesType = filters.type ? note.type === filters.type : true;
    const matchesStatus = filters.status
      ? note.status === filters.status
      : true;
    const matchesPriority = filters.priority
      ? note.priority === filters.priority
      : true;
    const matchesTags =
      filters.tags.length > 0
        ? filters.tags.every((tag) => note.tags.includes(tag))
        : true;
    const matchesDateRange = filters.dateRange
      ? note.date &&
        (!filters.dateRange.from || note.date >= filters.dateRange.from) &&
        (!filters.dateRange.to || note.date <= filters.dateRange.to)
      : true;
    const matchesSearchText = filters.searchText
      ? note.title.toLowerCase().includes(filters.searchText?.toLowerCase()) ||
        note.content?.toLowerCase().includes(filters.searchText.toLowerCase())
      : true;

    return (
      matchesType &&
      matchesStatus &&
      matchesPriority &&
      matchesTags &&
      matchesDateRange &&
      matchesSearchText
    );
  });

  return filteredNotes;
};
