import { i } from "@instantdb/core";

const graph = i.graph(
  {
    events: i.entity({
      title: i.string(),
      date: i.string(),
      posterUrl: i.string().optional(),
      price: i.number(),
      published: i.boolean(),
      createdDate: i.string(),
    }),
    registrations: i.entity({
      eventId: i.string(),
      name: i.string(),
      email: i.string(),
      phone: i.string(),
      address: i.string(),
      registeredAt: i.string(),
      paid: i.boolean(),
      stripeSessionId: i.string().optional(),
    }),
  },
  {}
);

export default graph;
